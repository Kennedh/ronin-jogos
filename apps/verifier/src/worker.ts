import { setImmediate as yieldLoop } from "node:timers/promises";
import { VerificationQueue, LeaseLost, wallTime } from "@ronin/data";
import type { VerificationLease } from "@ronin/data";
import { decodeTransport } from "@ronin/contracts/node-transport";
import {
  replayCursor,
  appendSegment,
  assertFinish,
} from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
import { stateHash } from "@ronin/contracts/canonical";
import type { BossOutcome } from "@ronin/runner-core";
import { createState, playSegment, add } from "@ronin/runner-core";
import { loadManifest, courseFor } from "@ronin/content/runner-manifest";
import { verifierBudget } from "./budget.ts";
class InvalidReplay extends Error {}
class Cancelled extends Error {}
function invalid(error: unknown): never {
  throw new InvalidReplay(
    error instanceof Error ? error.message : "invalid_replay",
  );
}
export interface WorkerOptions {
  signal?: AbortSignal;
  ticksPerBatch?: number;
  onBatch?: () => void | Promise<void>;
}
export async function verifyLease(
  queue: VerificationQueue,
  lease: VerificationLease,
  options: WorkerOptions = {},
) {
  const { ticksPerBatch } = verifierBudget(1, options.ticksPerBatch ?? 3600);
  const check = () => {
    if (options.signal?.aborted) throw new Cancelled();
  };
  try {
    check();
    await queue.heartbeat(lease);
    const run = await queue.work(lease);
    const manifest = await loadManifest(run.manifest, run.rules_hash).catch(
      invalid,
    );
    if (
      run.final_segment_index === null ||
      run.final_tick === null ||
      !run.finish_received_at ||
      !run.submitted_complete_at
    )
      throw new Error("missing_finish_commitment");
    try {
      wallTime(run, Number(run.final_tick), run.finish_received_at);
    } catch (error) {
      invalid(error);
    }
    const count = Number(run.final_segment_index) + 1;
    if (
      !Number.isSafeInteger(count) ||
      count < 1 ||
      count > run.resource_policy.max_segments_per_run
    )
      throw new InvalidReplay("part_limit");
    const bosses: BossOutcome[] = [];
    let state = createState(run.seed, manifest.physics, run.starting_region),
      cursor = replayCursor(run.id);
    for (let index = 0; index < count; index++) {
      check();
      const part = await queue.part(run.id, index);
      const { segment, decodedSize } = await decodeTransport(
        part.payload,
        part.encoding,
      ).catch(invalid);
      if (decodedSize !== part.decoded_size)
        throw new InvalidReplay("decoded_size_mismatch");
      cursor = await appendSegment(cursor, segment).catch(invalid);
      if (cursor.hash !== part.segment_hash)
        throw new InvalidReplay("stored_hash_mismatch");
      let start = segment.start_tick;
      do {
        check();
        const end = Math.min(segment.end_tick, start + ticksPerBatch),
          last = end === segment.end_tick;
        const slice: ReplaySegment = {
          ...segment,
          start_tick: start,
          end_tick: end,
          actions: segment.actions.filter(
            (a) => a.tick >= start && a.tick < end,
          ),
          controls: segment.controls.filter(
            (c) => c.tick >= start && (last ? c.tick <= end : c.tick < end),
          ),
        };
        try {
          const reach = add(
            state.distance,
            Math.ceil((manifest.physics.speedCeiling * (end - start)) / 60) +
              200000,
          );
          state = playSegment(
            state,
            slice,
            courseFor(
              manifest,
              run.seed,
              state.distance,
              reach,
              run.starting_region,
            ),
            undefined,
            manifest.physics,
            (events) => {
              for (const e of events) if (e.boss) bosses.push(e.boss);
            },
          );
        } catch (error) {
          invalid(error);
        }
        await options.onBatch?.();
        await yieldLoop();
        check();
        lease.expiresAt = await queue.heartbeat(lease);
        start = end;
      } while (start < segment.end_tick);
    }
    try {
      assertFinish(cursor, {
        final_segment_index: Number(run.final_segment_index),
        final_tick: Number(run.final_tick),
        final_hash: run.final_hash,
        end_reason: run.end_reason,
      });
    } catch (error) {
      invalid(error);
    }
    if (
      !["DEAD", "QUIT"].includes(state.status) ||
      state.endReason !== run.end_reason ||
      state.tick !== Number(run.final_tick)
    )
      throw new InvalidReplay("unproven_end_reason");
    check();
    const checksum = await stateHash(state);
    check();
    await queue.complete(lease, {
      score: state.score,
      distance: state.distance,
      activeTicks: state.tick,
      endReason: state.endReason!,
      stateHash: checksum,
      ...(manifest.rules_major === 4 ? { bosses } : {}),
    });
    return "VERIFIED" as const;
  } catch (error) {
    if (error instanceof LeaseLost) return "LEASE_LOST" as const;
    try {
      if (error instanceof InvalidReplay) {
        await queue.reject(lease, "INVALID_REPLAY");
        return "REJECTED" as const;
      }
      await queue.retry(
        lease,
        error instanceof Cancelled ? "WORKER_CANCELLED" : "WORKER_ERROR",
      );
      return "RETRY" as const;
    } catch (failure) {
      if (failure instanceof LeaseLost) return "LEASE_LOST" as const;
      throw failure;
    }
  }
}
export async function runOnce(
  queue: VerificationQueue,
  options: WorkerOptions = {},
) {
  if (options.signal?.aborted) return "IDLE" as const;
  const lease = await queue.claim();
  if (!lease) return "IDLE" as const;
  return verifyLease(queue, lease, options);
}

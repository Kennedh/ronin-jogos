import { randomUUID, randomBytes } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { canonical } from "@ronin/contracts/canonical";
import { validate } from "@ronin/contracts";
import type { components } from "@ronin/contracts";
import {
  FOUNDATION_MANIFEST,
  loadManifest,
  manifestHash,
} from "@ronin/content/runner-manifest";
import type { RunnerManifest } from "@ronin/content/runner-manifest";
import type { ReplaySegment, FinishRequest } from "@ronin/contracts/replay";
import { digest } from "./sessions.ts";
import { Fault, serverTime, transaction, resourcePolicy } from "./runtime.ts";
import type { Clock, ResourcePolicy } from "./runtime.ts";
type RunStart = components["schemas"]["RunStart"];
export interface RunRow {
  id: string;
  player_id: string;
  rules_hash: string;
  mode: "FULL" | "REGIONAL";
  starting_region: "BAMBOO" | "TEMPLE" | "MOUNTAINS" | "CASTLE";
  seed: string;
  started_at: Date;
  expires_at: Date;
  status: components["schemas"]["RunStatus"]["status"];
  finish_received_at: Date | null;
  upload_deadline: Date | null;
  submitted_complete_at: Date | null;
  final_segment_index: string | null;
  final_tick: string | null;
  final_hash: string | null;
  end_reason: FinishRequest["end_reason"] | null;
  rejection_code: string | null;
  resource_policy: ResourcePolicy;
}
export async function expireRun(db: PoolClient, run: RunRow, now: Date) {
  if (
    (run.status === "ACTIVE" && now > run.expires_at) ||
    (run.status === "AWAITING_SEGMENTS" &&
      run.upload_deadline &&
      now > run.upload_deadline)
  ) {
    await db.query("UPDATE runs SET status='EXPIRED' WHERE id=$1", [run.id]);
    run.status = "EXPIRED";
  }
}
export function wallTime(run: RunRow, tick: number, now: Date) {
  const end = run.finish_received_at ?? now;
  if (
    tick >
    Math.floor(((end.getTime() - run.started_at.getTime()) * 60) / 1000) +
      run.resource_policy.wall_time_tolerance_ticks
  )
    throw new Fault(422, "ACTIVE_TIME_INVALID");
}
export class Runs {
  readonly policy: ResourcePolicy;
  readonly pool: Pool;
  readonly clock: Clock;
  readonly manifest: RunnerManifest;
  constructor(
    pool: Pool,
    clock?: Clock,
    policy?: ResourcePolicy,
    manifest: RunnerManifest = FOUNDATION_MANIFEST,
  ) {
    this.pool = pool;
    this.clock = clock;
    this.manifest = manifest;
    this.policy = resourcePolicy(policy);
  }
  async lock(db: PoolClient, playerId: string, runId: string): Promise<RunRow> {
    // API takes owner first to serialize storage/active quotas across that owner's runs.
    await db.query("SELECT id FROM players WHERE id=$1 FOR UPDATE", [playerId]);
    const row = (
      await db.query<RunRow>(
        "SELECT * FROM runs WHERE id=$1 AND player_id=$2 FOR UPDATE",
        [runId, playerId],
      )
    ).rows[0];
    if (!row) throw new Fault(404, "RUN_NOT_FOUND");
    return row;
  }
  async authorize(playerId: string, runId: string) {
    if (
      !(
        await this.pool.query(
          "SELECT 1 FROM runs WHERE id=$1 AND player_id=$2",
          [runId, playerId],
        )
      ).rowCount
    )
      throw new Fault(404, "RUN_NOT_FOUND");
  }
  async ticket(db: PoolClient, run: RunRow, now: Date) {
    const record = (
      await db.query<{ manifest: RunnerManifest }>(
        "SELECT manifest FROM rules_versions WHERE manifest_hash=$1",
        [run.rules_hash],
      )
    ).rows[0];
    if (!record) throw new Error("missing_rules");
    const manifest = await loadManifest(record.manifest, run.rules_hash);
    const { physics: _physics, ...versions } = manifest;
    void _physics;
    return {
      run_id: run.id,
      mode: run.mode,
      starting_region_id: run.starting_region,
      seed: run.seed,
      versions: { ...versions, rules_manifest_hash: run.rules_hash },
      started_at: run.started_at.toISOString(),
      expires_at: run.expires_at.toISOString(),
      server_time: now.toISOString(),
      limits: run.resource_policy,
    };
  }
  async start(
    playerId: string,
    input: unknown,
    key: string,
    sessionId?: string,
  ) {
    if (!validate("RunStart", input)) throw new Fault(422, "INVALID_REQUEST");
    if (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,100}$/.test(key))
      throw new Fault(422, "IDEMPOTENCY_KEY_REQUIRED");
    const body = input as RunStart,
      requestHash = digest(canonical(body)).toString("hex");
    const manifest = await loadManifest(this.manifest),
      hash = await manifestHash(manifest);
    return transaction(this.pool, async (db) => {
      await db.query("SELECT id FROM players WHERE id=$1 FOR UPDATE", [
        playerId,
      ]);
      const now = await serverTime(db, this.clock);
      if (
        sessionId &&
        !(
          await db.query(
            "SELECT 1 FROM sessions WHERE id=$1 AND player_id=$2 AND revoked_at IS NULL AND expires_at>$3",
            [sessionId, playerId, now],
          )
        ).rowCount
      )
        throw new Fault(401, "SESSION_REQUIRED");
      const prior = (
        await db.query<{ request_hash: string; run_id: string }>(
          "SELECT * FROM run_start_keys WHERE player_id=$1 AND key_digest=$2",
          [playerId, digest(key)],
        )
      ).rows[0];
      if (prior) {
        if (prior.request_hash !== requestHash)
          throw new Fault(409, "IDEMPOTENCY_CONFLICT");
        const old = (
          await db.query<RunRow>("SELECT * FROM runs WHERE id=$1", [
            prior.run_id,
          ])
        ).rows[0]!;
        return { created: false, ticket: await this.ticket(db, old, now) };
      }
      await db.query(
        "UPDATE runs SET status='EXPIRED' WHERE player_id=$1 AND ((status='ACTIVE' AND expires_at<$2) OR (status='AWAITING_SEGMENTS' AND upload_deadline<$2))",
        [playerId, now],
      );
      const count = (
        await db.query<{ count: string }>(
          "SELECT count(*) FROM runs WHERE player_id=$1 AND status IN ('ACTIVE','AWAITING_SEGMENTS','PENDING','VERIFYING')",
          [playerId],
        )
      ).rows[0]!;
      if (Number(count.count) >= this.policy.max_active_runs)
        throw new Fault(429, "ACTIVE_RUN_QUOTA");
      if (
        Number(
          (
            await db.query<{ count: string }>(
              "SELECT count(*) FROM run_verification_jobs WHERE state IN ('PENDING','RUNNING')",
            )
          ).rows[0]!.count,
        ) >= 5000
      )
        throw new Fault(503, "VERIFIER_BUSY");
      const region = body.mode === "FULL" ? "BAMBOO" : body.region_id!;
      if (
        !(
          await db.query(
            "SELECT 1 FROM player_regions WHERE player_id=$1 AND region_id=$2",
            [playerId, region],
          )
        ).rowCount
      )
        throw new Fault(403, "REGION_LOCKED");
      await db.query(
        "INSERT INTO rules_versions(manifest_hash,manifest) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [hash, JSON.stringify(manifest)],
      );
      const row = (
        await db.query<RunRow>(
          `INSERT INTO runs(id,player_id,rules_hash,mode,starting_region,seed,started_at,expires_at,resource_policy)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [
            randomUUID(),
            playerId,
            hash,
            body.mode,
            region,
            randomBytes(16).toString("hex"),
            now,
            new Date(now.getTime() + 72 * 3600000),
            JSON.stringify(this.policy),
          ],
        )
      ).rows[0]!;
      await db.query(
        "INSERT INTO run_start_keys(player_id,key_digest,request_hash,run_id) VALUES($1,$2,$3,$4)",
        [playerId, digest(key), requestHash, row.id],
      );
      return { created: true, ticket: await this.ticket(db, row, now) };
    });
  }
  async statusRow(db: PoolClient, run: RunRow) {
    const result: components["schemas"]["RunStatus"] = {
      run_id: run.id,
      status: run.status,
      expires_at: run.expires_at.toISOString(),
      upload_deadline: run.upload_deadline?.toISOString() ?? null,
      submitted_complete_at: run.submitted_complete_at?.toISOString() ?? null,
    };
    if (run.status === "VERIFIED") {
      const out = (
        await db.query<{
          score: string;
          real_distance: string;
          verified_at: Date;
          end_reason: FinishRequest["end_reason"];
          ranked: boolean;
        }>("SELECT * FROM run_outcomes WHERE run_id=$1", [run.id])
      ).rows[0];
      if (!out) throw new Error("missing_verified_outcome");
      const record = (
        await db.query<{ manifest: RunnerManifest }>(
          "SELECT manifest FROM rules_versions WHERE manifest_hash=$1",
          [run.rules_hash],
        )
      ).rows[0]!;
      const physics = (await loadManifest(record.manifest, run.rules_hash))
        .physics;
      if (record.manifest.rules_major === 4)
        result.boss_results = (
          await db.query(
            "SELECT boss_id, count(*) FILTER(WHERE result='DEFEATED')::int AS defeated, count(*) FILTER(WHERE result='RETREATED')::int AS retreated, sum(bonus)::text AS bonus FROM run_boss_outcomes WHERE run_id=$1 GROUP BY boss_id ORDER BY boss_id",
            [run.id],
          )
        ).rows;
      Object.assign(result, {
        score: out.score,
        distance_m: Number(
          BigInt(out.real_distance) /
            BigInt(physics.scale * physics.unitsPerMeter),
        ),
        verified_at: out.verified_at.toISOString(),
        end_reason: out.end_reason,
        ranked: out.ranked,
      });
    } else if (run.status === "REJECTED")
      result.rejection_code = run.rejection_code ?? "REPLAY_INVALID";
    return result;
  }
  async getManifest(playerId: string, runId: string) {
    const row = (
      await this.pool.query<{ rules_hash: string; manifest: RunnerManifest }>(
        "SELECT r.rules_hash,v.manifest FROM runs r JOIN rules_versions v ON v.manifest_hash=r.rules_hash WHERE r.id=$1 AND r.player_id=$2",
        [runId, playerId],
      )
    ).rows[0];
    if (!row) throw new Fault(404, "RUN_NOT_FOUND");
    return {
      manifest_hash: row.rules_hash,
      manifest: await loadManifest(row.manifest, row.rules_hash),
    };
  }
  async status(playerId: string, runId: string) {
    return transaction(this.pool, async (db) => {
      const run = await this.lock(db, playerId, runId);
      await expireRun(db, run, await serverTime(db, this.clock));
      return this.statusRow(db, run);
    });
  }
  async submitIfComplete(db: PoolClient, run: RunRow, now: Date) {
    if (run.status !== "AWAITING_SEGMENTS") return;
    const total = (
      await db.query<{ count: string; highest: string | null }>(
        "SELECT count(*),max(segment_index) AS highest FROM run_segments WHERE run_id=$1",
        [run.id],
      )
    ).rows[0]!;
    if (
      total.highest !== null &&
      BigInt(total.highest) > BigInt(run.final_segment_index!)
    )
      throw new Fault(409, "FINISH_PARTS_CONFLICT");
    if (BigInt(total.count) !== BigInt(run.final_segment_index!) + 1n) return;
    const bad = (
      await db.query(
        `WITH ordered AS (SELECT *,lag(end_tick) OVER(ORDER BY segment_index) AS prior_tick,lag(segment_hash) OVER(ORDER BY segment_index) AS prior_hash FROM run_segments WHERE run_id=$1)
     SELECT 1 FROM ordered WHERE (segment_index>0 AND (start_tick<>prior_tick OR previous_hash<>prior_hash)) OR
      (segment_index=$2 AND (end_tick<>$3 OR segment_hash<>$4)) LIMIT 1`,
        [run.id, run.final_segment_index, run.final_tick, run.final_hash],
      )
    ).rowCount;
    if (bad) {
      await db.query(
        "UPDATE runs SET status='REJECTED',rejection_code='REPLAY_INVALID' WHERE id=$1",
        [run.id],
      );
      run.status = "REJECTED";
      run.rejection_code = "REPLAY_INVALID";
      return;
    }
    await db.query(
      "UPDATE runs SET status='PENDING',submitted_complete_at=$2 WHERE id=$1",
      [run.id, now],
    );
    await db.query(
      "INSERT INTO run_verification_jobs(run_id,available_at) VALUES($1,$2)",
      [run.id, now],
    );
    run.status = "PENDING";
    run.submitted_complete_at = now;
  }
  async put(
    playerId: string,
    segment: ReplaySegment,
    hash: string,
    payload: Buffer,
    encoding: "identity" | "gzip",
    decodedSize: number,
  ) {
    return transaction(this.pool, async (db) => {
      const run = await this.lock(db, playerId, segment.run_id),
        now = await serverTime(db, this.clock);
      const old = (
        await db.query<{ segment_hash: string }>(
          "SELECT segment_hash FROM run_segments WHERE run_id=$1 AND segment_index=$2",
          [run.id, segment.index],
        )
      ).rows[0];
      if (old) {
        if (old.segment_hash !== hash) throw new Fault(409, "SEGMENT_CONFLICT");
        return { created: false };
      }
      await expireRun(db, run, now);
      if (run.status === "EXPIRED") throw new Fault(422, "RUN_EXPIRED", true);
      if (!["ACTIVE", "AWAITING_SEGMENTS"].includes(run.status))
        throw new Fault(409, "RUN_CLOSED");
      wallTime(run, segment.end_tick, now);
      if (segment.index >= run.resource_policy.max_segments_per_run)
        throw new Fault(429, "SEGMENT_QUOTA");
      if (
        run.final_tick !== null &&
        (segment.index > Number(run.final_segment_index) ||
          segment.end_tick > Number(run.final_tick))
      )
        throw new Fault(409, "FINISH_PARTS_CONFLICT");
      const sizes = (
        await db.query<{ run_bytes: string; player_bytes: string }>(
          `SELECT COALESCE(sum(octet_length(s.payload)) FILTER(WHERE r.id=$2),0) AS run_bytes,COALESCE(sum(octet_length(s.payload)),0) AS player_bytes FROM runs r JOIN run_segments s ON r.id=s.run_id WHERE r.player_id=$1`,
          [playerId, run.id],
        )
      ).rows[0]!;
      if (
        BigInt(sizes.run_bytes) + BigInt(payload.length) >
          BigInt(run.resource_policy.max_run_encoded_bytes) ||
        BigInt(sizes.player_bytes) + BigInt(payload.length) >
          BigInt(run.resource_policy.max_player_encoded_bytes)
      )
        throw new Fault(429, "STORAGE_QUOTA");
      await db.query(
        `INSERT INTO run_segments(run_id,segment_index,start_tick,end_tick,segment_hash,previous_hash,payload,decoded_size,encoding,received_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          run.id,
          segment.index,
          segment.start_tick,
          segment.end_tick,
          hash,
          segment.previous_hash,
          payload,
          decodedSize,
          encoding,
          now,
        ],
      );
      await this.submitIfComplete(db, run, now);
      return { created: true };
    });
  }
  async finish(playerId: string, runId: string, input: unknown) {
    if (!validate("FinishRequest", input))
      throw new Fault(422, "INVALID_REQUEST");
    const finish = input as FinishRequest;
    return transaction(this.pool, async (db) => {
      const run = await this.lock(db, playerId, runId),
        now = await serverTime(db, this.clock);
      if (run.finish_received_at) {
        if (
          Number(run.final_segment_index) !== finish.final_segment_index ||
          Number(run.final_tick) !== finish.final_tick ||
          run.final_hash !== finish.final_hash ||
          run.end_reason !== finish.end_reason
        )
          throw new Fault(409, "FINISH_CONFLICT");
        await expireRun(db, run, now);
        return this.statusRow(db, run);
      }
      await expireRun(db, run, now);
      if (run.status === "EXPIRED") throw new Fault(422, "RUN_EXPIRED", true);
      if (run.status !== "ACTIVE") throw new Fault(409, "RUN_CLOSED");
      wallTime(run, finish.final_tick, now);
      if (
        finish.final_segment_index >= run.resource_policy.max_segments_per_run
      )
        throw new Fault(429, "SEGMENT_QUOTA");
      if (finish.final_tick === 0 && finish.end_reason !== "QUIT")
        throw new Fault(422, "INVALID_FINISH");
      const values = [
        run.id,
        now,
        new Date(now.getTime() + 86400000),
        finish.final_segment_index,
        finish.final_tick,
        finish.final_hash,
        finish.end_reason,
      ];
      const updated = (
        await db.query<RunRow>(
          `UPDATE runs SET status='AWAITING_SEGMENTS',finish_received_at=$2,upload_deadline=$3,final_segment_index=$4,final_tick=$5,final_hash=$6,end_reason=$7 WHERE id=$1 RETURNING *`,
          values,
        )
      ).rows[0]!;
      await this.submitIfComplete(db, updated, now);
      return this.statusRow(db, updated);
    });
  }
}

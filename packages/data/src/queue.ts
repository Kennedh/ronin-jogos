import type { Pool, PoolClient } from "pg";
import type { RunnerManifest } from "@ronin/content/runner-manifest";
import { Fault, transaction, serverTime } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
import type { RunRow } from "./runs.ts";
import type { VerificationLease } from "./index.ts";
export class LeaseLost extends Error {
  constructor() {
    super("verification_lease_lost");
  }
}
export interface VerifiedResult {
  score: string;
  distance: number;
  activeTicks: number;
  endReason: "HP_ZERO" | "ABYSS" | "QUIT";
  stateHash: string;
}
interface JobRow {
  generation: string;
  attempts: number;
  state: string;
  lease_until: Date | null;
}
export function weekWindow(start: Date) {
  const midnight = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const monday = midnight - ((start.getUTCDay() + 6) % 7) * 86400000;
  return { start: new Date(monday), graceEnd: new Date(monday + 8 * 86400000) };
}
export class VerificationQueue {
  readonly pool: Pool;
  readonly clock: Clock;
  readonly leaseMs: number;
  readonly maxAttempts: number;
  constructor(pool: Pool, clock?: Clock, leaseMs = 30000, maxAttempts = 5) {
    this.pool = pool;
    this.clock = clock;
    this.leaseMs = leaseMs;
    this.maxAttempts = maxAttempts;
    if (
      !Number.isSafeInteger(leaseMs) ||
      leaseMs < 10 ||
      leaseMs > 300000 ||
      !Number.isSafeInteger(maxAttempts) ||
      maxAttempts < 1 ||
      maxAttempts > 10
    )
      throw new Error("invalid_queue_policy");
  }
  async claim(): Promise<VerificationLease | null> {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      // Lock order is run -> job everywhere. SKIP LOCKED permits independent workers.
      const run = (
        await db.query<{ id: string }>(
          `SELECT r.id FROM runs r JOIN run_verification_jobs j ON j.run_id=r.id
       WHERE r.status IN ('PENDING','VERIFYING') AND ((j.state='PENDING' AND j.available_at<=$1) OR (j.state='RUNNING' AND j.lease_until<=$1))
       ORDER BY j.available_at,r.id LIMIT 1 FOR UPDATE OF r SKIP LOCKED`,
          [now],
        )
      ).rows[0];
      if (!run) return null;
      const job = (
        await db.query<JobRow>(
          "SELECT * FROM run_verification_jobs WHERE run_id=$1 FOR UPDATE",
          [run.id],
        )
      ).rows[0]!;
      if (job.attempts >= this.maxAttempts) {
        await db.query(
          "UPDATE run_verification_jobs SET state='FAILED',lease_until=NULL,last_error_code='RETRY_EXHAUSTED' WHERE run_id=$1",
          [run.id],
        );
        await db.query(
          "UPDATE runs SET status='REJECTED',rejection_code='VERIFIER_UNAVAILABLE' WHERE id=$1",
          [run.id],
        );
        return null;
      }
      const until = new Date(now.getTime() + this.leaseMs);
      const next = (
        await db.query<JobRow>(
          "UPDATE run_verification_jobs SET state='RUNNING',generation=generation+1,attempts=attempts+1,lease_until=$2 WHERE run_id=$1 RETURNING *",
          [run.id, until],
        )
      ).rows[0]!;
      await db.query("UPDATE runs SET status='VERIFYING' WHERE id=$1", [
        run.id,
      ]);
      return {
        jobId: run.id,
        generation: BigInt(next.generation),
        expiresAt: until,
      };
    });
  }
  async locked(db: PoolClient, lease: VerificationLease) {
    const run = (
      await db.query<RunRow>("SELECT * FROM runs WHERE id=$1 FOR UPDATE", [
        lease.jobId,
      ])
    ).rows[0];
    const job = (
      await db.query<JobRow>(
        "SELECT * FROM run_verification_jobs WHERE run_id=$1 FOR UPDATE",
        [lease.jobId],
      )
    ).rows[0];
    if (!run || !job || BigInt(job.generation) !== lease.generation)
      throw new LeaseLost();
    return { run, job, now: await serverTime(db, this.clock) };
  }
  checkLive(run: RunRow, job: JobRow, now: Date) {
    if (
      run.status !== "VERIFYING" ||
      job.state !== "RUNNING" ||
      !job.lease_until ||
      job.lease_until <= now
    )
      throw new LeaseLost();
  }
  async heartbeat(lease: VerificationLease) {
    return transaction(this.pool, async (db) => {
      const { run, job, now } = await this.locked(db, lease);
      this.checkLive(run, job, now);
      const until = new Date(now.getTime() + this.leaseMs);
      await db.query(
        "UPDATE run_verification_jobs SET lease_until=$2 WHERE run_id=$1",
        [lease.jobId, until],
      );
      return until;
    });
  }
  async work(lease: VerificationLease) {
    const row = (
      await this.pool.query<RunRow & { manifest: RunnerManifest }>(
        "SELECT r.*,v.manifest FROM runs r JOIN rules_versions v ON v.manifest_hash=r.rules_hash WHERE r.id=$1",
        [lease.jobId],
      )
    ).rows[0];
    if (!row) throw new LeaseLost();
    return row;
  }
  async part(runId: string, index: number) {
    const row = (
      await this.pool.query<{
        payload: Buffer;
        encoding: string;
        decoded_size: number;
        segment_hash: string;
      }>(
        "SELECT payload,encoding,decoded_size,segment_hash FROM run_segments WHERE run_id=$1 AND segment_index=$2",
        [runId, index],
      )
    ).rows[0];
    if (!row) throw new Error("missing_durable_segment");
    return row;
  }
  async complete(lease: VerificationLease, result: VerifiedResult) {
    if (
      !/^(0|[1-9][0-9]*)$/.test(result.score) ||
      !Number.isSafeInteger(result.distance) ||
      result.distance < 0 ||
      !Number.isSafeInteger(result.activeTicks) ||
      result.activeTicks < 0 ||
      !/^[a-f0-9]{64}$/.test(result.stateHash)
    )
      throw new Error("invalid_verifier_result");
    return transaction(this.pool, async (db) => {
      const { run, job, now } = await this.locked(db, lease);
      if (run.status === "VERIFIED" && job.state === "DONE") {
        const old = (
          await db.query<{
            state_hash: string;
            score: string;
            real_distance: string;
            active_ticks: string;
            end_reason: string;
          }>("SELECT * FROM run_outcomes WHERE run_id=$1", [run.id])
        ).rows[0]!;
        if (
          old.state_hash !== result.stateHash ||
          old.score !== result.score ||
          Number(old.real_distance) !== result.distance ||
          Number(old.active_ticks) !== result.activeTicks ||
          old.end_reason !== result.endReason
        )
          throw new Fault(409, "OUTCOME_CONFLICT");
        return;
      }
      this.checkLive(run, job, now);
      if (
        Number(run.final_tick) !== result.activeTicks ||
        run.end_reason !== result.endReason
      )
        throw new Error("verifier_finish_mismatch");
      const ranked = result.endReason !== "QUIT",
        week = weekWindow(run.started_at);
      const weekly =
        ranked &&
        !!run.submitted_complete_at &&
        run.submitted_complete_at < week.graceEnd;
      await db.query(
        "UPDATE runs SET status='VERIFIED',rejection_code=NULL WHERE id=$1",
        [run.id],
      );
      await db.query(
        `INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,verified_at,state_hash,rules_hash,week_starts_at,weekly_eligible)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          run.id,
          run.player_id,
          result.score,
          result.distance,
          result.activeTicks,
          result.endReason,
          ranked,
          now,
          result.stateHash,
          run.rules_hash,
          week.start,
          weekly,
        ],
      );
      await db.query(
        "INSERT INTO outbox_events(event_key,run_id,type,payload,created_at) VALUES($1,$2,'RUN_VERIFIED',$3,$4)",
        [
          "run-verified:" + run.id,
          run.id,
          JSON.stringify({
            run_id: run.id,
            player_id: run.player_id,
            score: result.score,
            distance: result.distance,
            active_ticks: result.activeTicks,
            end_reason: result.endReason,
            ranked,
            rules_hash: run.rules_hash,
            week_starts_at: week.start.toISOString(),
            weekly_eligible: weekly,
          }),
          now,
        ],
      );
      await db.query(
        "UPDATE run_verification_jobs SET state='DONE',lease_until=NULL,last_error_code=NULL WHERE run_id=$1",
        [run.id],
      );
    });
  }
  async reject(lease: VerificationLease, technicalCode: string) {
    return transaction(this.pool, async (db) => {
      const { run, job, now } = await this.locked(db, lease);
      this.checkLive(run, job, now);
      await db.query(
        "UPDATE runs SET status='REJECTED',rejection_code='REPLAY_INVALID' WHERE id=$1",
        [run.id],
      );
      await db.query(
        "UPDATE run_verification_jobs SET state='DONE',lease_until=NULL,last_error_code=$2 WHERE run_id=$1",
        [run.id, technicalCode],
      );
    });
  }
  async retry(lease: VerificationLease, reason = "WORKER_ERROR") {
    return transaction(this.pool, async (db) => {
      const { run, job, now } = await this.locked(db, lease);
      this.checkLive(run, job, now);
      const exhausted = job.attempts >= this.maxAttempts;
      await db.query(
        "UPDATE runs SET status=$2,rejection_code=$3 WHERE id=$1",
        [
          run.id,
          exhausted ? "REJECTED" : "PENDING",
          exhausted ? "VERIFIER_UNAVAILABLE" : null,
        ],
      );
      await db.query(
        "UPDATE run_verification_jobs SET state=$2,lease_until=NULL,last_error_code=$3,available_at=$4 WHERE run_id=$1",
        [
          run.id,
          exhausted ? "FAILED" : "PENDING",
          reason,
          new Date(
            now.getTime() + Math.min(60000, 1000 * 2 ** (job.attempts - 1)),
          ),
        ],
      );
    });
  }
}

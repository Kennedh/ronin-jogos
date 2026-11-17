import type { Pool, PoolClient } from "pg";
export class Fault extends Error {
  readonly status: number;
  readonly code: string;
  readonly commit: boolean;
  constructor(status: number, code: string, commit = false) {
    super(code);
    this.status = status;
    this.code = code;
    this.commit = commit;
  }
}
export type Clock = (() => Date) | undefined;
export async function serverTime(db: PoolClient, clock?: Clock): Promise<Date> {
  if (clock) {
    const value = clock();
    if (!Number.isFinite(value.getTime()))
      throw new Error("invalid_server_clock");
    return new Date(value);
  }
  return (await db.query<{ now: Date }>("SELECT clock_timestamp() AS now"))
    .rows[0]!.now;
}
export async function transaction<T>(
  pool: Pool,
  work: (db: PoolClient) => Promise<T>,
): Promise<T> {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    await db.query("SET LOCAL lock_timeout='5s'");
    await db.query("SET LOCAL statement_timeout='15s'");
    const result = await work(db);
    await db.query("COMMIT");
    return result;
  } catch (error) {
    await db.query(
      error instanceof Fault && error.commit ? "COMMIT" : "ROLLBACK",
    );
    throw error;
  } finally {
    db.release();
  }
}
export const DEFAULT_POLICY = Object.freeze({
  segment_ticks: 3600,
  max_encoded_bytes: 262144,
  max_decoded_bytes: 1048576,
  max_actions_per_tick: 2,
  upload_grace_seconds: 86400,
  max_run_encoded_bytes: 134217728,
  max_player_encoded_bytes: 536870912,
  max_segments_per_run: 10000,
  max_active_runs: 3,
  wall_time_tolerance_ticks: 120,
});
export type ResourcePolicy = {
  readonly [K in keyof typeof DEFAULT_POLICY]: number;
};
export function resourcePolicy(
  input: ResourcePolicy = DEFAULT_POLICY,
): ResourcePolicy {
  if (
    Object.keys(input).sort().join() !==
    Object.keys(DEFAULT_POLICY).sort().join()
  )
    throw new Error("invalid_resource_policy");
  for (const value of Object.values(input))
    if (!Number.isSafeInteger(value) || value < 1)
      throw new Error("invalid_resource_policy");
  for (const key of [
    "segment_ticks",
    "max_encoded_bytes",
    "max_decoded_bytes",
    "max_actions_per_tick",
    "upload_grace_seconds",
  ] as const)
    if (input[key] !== DEFAULT_POLICY[key])
      throw new Error("unsupported_transport_policy");
  return Object.freeze({ ...input });
}

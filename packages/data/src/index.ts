/** Schema identifiers shared by migrations/repositories in 1B. */
export const RUN_SEGMENT_IDENTITY = ["run_id", "segment_index"] as const;
export interface VerificationLease {
  jobId: string;
  generation: bigint;
  expiresAt: Date;
}
/** Postgres implementation is deliberately deferred to 1B/1C, not emulated. */

export { migrate, migrationFiles, checksum } from "./migrate.ts";
export type { Migration } from "./migrate.ts";

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

export {
  Fault,
  transaction,
  serverTime,
  DEFAULT_POLICY,
  resourcePolicy,
} from "./runtime.ts";
export type { Clock, ResourcePolicy } from "./runtime.ts";
export { Sessions, rateLimit } from "./sessions.ts";
export type { Session } from "./sessions.ts";
export { Runs, wallTime } from "./runs.ts";
export type { RunRow } from "./runs.ts";
export { VerificationQueue, LeaseLost, weekWindow } from "./queue.ts";
export type { VerifiedResult } from "./queue.ts";

export { Accounts } from "./accounts.ts";
export { Merges } from "./merges.ts";
export { NICKNAME_REASONS, Privacy } from "./privacy.ts";
export { PasswordHasher, passwordPolicy } from "./passwords.ts";
export { deliverAuthMail } from "./auth-mail.ts";
export type { AuthMail, MailTransport } from "./auth-mail.ts";

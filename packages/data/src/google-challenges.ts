import type { PoolClient } from "pg";
import { Fault } from "./runtime.ts";
import { digest } from "./sessions.ts";

export type GooglePurpose = "SIGN_IN" | "LINK" | "REAUTH" | "MERGE";
export interface GoogleCredential {
  subject: string;
  nonce: string;
  expiresAt: Date;
}

export async function consumeGoogleChallenge(
  db: PoolClient,
  sessionId: string,
  purpose: GooglePurpose,
  credential: GoogleCredential,
  now: Date,
) {
  if (
    credential.expiresAt <= now ||
    !(
      await db.query(
        "DELETE FROM google_challenges WHERE session_id=$1 AND purpose=$2 AND nonce_digest=$3 AND expires_at>$4",
        [sessionId, purpose, digest(credential.nonce), now],
      )
    ).rowCount
  )
    throw new Fault(401, "GOOGLE_CREDENTIAL_INVALID");
}

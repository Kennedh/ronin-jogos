import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { transaction, serverTime } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
export interface AuthMail {
  to: string;
  subject: string;
  text: string;
  locale: "pt-BR" | "en";
  purpose: "VERIFY" | "RESET";
  link: string;
}
export interface MailTransport {
  send(id: string, mail: AuthMail): Promise<void>;
}
export function checkMailKey(key: Buffer) {
  if (key.length !== 32) throw new Error("invalid_auth_mail_key");
}
export async function enqueueAuthMail(
  db: PoolClient,
  key: Buffer,
  mail: AuthMail,
  now: Date,
) {
  checkMailKey(key);
  const id = randomUUID(),
    nonce = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(Buffer.from("ronin-auth-mail-v1:" + id));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(mail), "utf8"),
    cipher.final(),
  ]);
  await db.query(
    "INSERT INTO auth_mail_outbox(id,ciphertext,nonce,tag,created_at,available_at) VALUES($1,$2,$3,$4,$5,$5)",
    [id, ciphertext, nonce, cipher.getAuthTag(), now],
  );
}
/** Durable claim/fence and idempotent transport. Never logs recipient, token or decrypted payload. */
export async function deliverAuthMail(
  pool: Pool,
  key: Buffer,
  transport: MailTransport,
  clock?: Clock,
) {
  checkMailKey(key);
  const claim = await transaction(pool, async (db) => {
    const now = await serverTime(db, clock),
      row = (
        await db.query(
          "SELECT * FROM auth_mail_outbox WHERE (state='PENDING' AND available_at<=$1) OR (state='SENDING' AND lease_until<=$1) ORDER BY available_at,id LIMIT 1 FOR UPDATE SKIP LOCKED",
          [now],
        )
      ).rows[0];
    if (!row) return null;
    const lease = new Date(now.getTime() + 30000);
    return (
      await db.query(
        "UPDATE auth_mail_outbox SET state='SENDING',generation=generation+1,attempts=attempts+1,lease_until=$2 WHERE id=$1 RETURNING *",
        [row.id, lease],
      )
    ).rows[0];
  });
  if (!claim) return "IDLE" as const;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, claim.nonce);
    decipher.setAAD(Buffer.from("ronin-auth-mail-v1:" + claim.id));
    decipher.setAuthTag(claim.tag);
    const mail = JSON.parse(
      Buffer.concat([
        decipher.update(claim.ciphertext),
        decipher.final(),
      ]).toString("utf8"),
    ) as AuthMail;
    await transport.send(claim.id, mail);
    return await transaction(pool, async (db) => {
      const now = await serverTime(db, clock);
      const r = await db.query(
        "UPDATE auth_mail_outbox SET state='SENT',lease_until=NULL,delivered_at=$3 WHERE id=$1 AND state='SENDING' AND generation=$2 AND lease_until>$3",
        [claim.id, claim.generation, now],
      );
      return r.rowCount ? ("SENT" as const) : ("LEASE_LOST" as const);
    });
  } catch {
    return await transaction(pool, async (db) => {
      const now = await serverTime(db, clock);
      const r = await db.query(
        "UPDATE auth_mail_outbox SET state=$3,lease_until=NULL,available_at=$4 WHERE id=$1 AND state='SENDING' AND generation=$2",
        [
          claim.id,
          claim.generation,
          claim.attempts >= 8 ? "FAILED" : "PENDING",
          new Date(
            now.getTime() +
              Math.min(60000, 1000 * 2 ** Math.min(6, claim.attempts - 1)),
          ),
        ],
      );
      return r.rowCount ? ("RETRY" as const) : ("LEASE_LOST" as const);
    });
  }
}

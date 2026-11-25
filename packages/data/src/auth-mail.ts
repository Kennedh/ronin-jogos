import {
  createCipheriv,
  createHash,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { Fault, transaction, serverTime } from "./runtime.ts";
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
  playerId?: string,
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
    "INSERT INTO auth_mail_outbox(id,ciphertext,nonce,tag,created_at,available_at,player_id) VALUES($1,$2,$3,$4,$5,$5,$6)",
    [id, ciphertext, nonce, cipher.getAuthTag(), now, playerId ?? null],
  );
}
type SealedAuthMail = {
  id: string;
  nonce: Buffer;
  tag: Buffer;
  ciphertext: Buffer;
};

function unsealAuthMail(key: Buffer, row: SealedAuthMail) {
  const decipher = createDecipheriv("aes-256-gcm", key, row.nonce);
  decipher.setAAD(Buffer.from("ronin-auth-mail-v1:" + row.id));
  decipher.setAuthTag(row.tag);
  return JSON.parse(
    Buffer.concat([decipher.update(row.ciphertext), decipher.final()]).toString(
      "utf8",
    ),
  ) as AuthMail;
}

/** Legacy mail has a token in its authenticated ciphertext, linked to account_tokens. */
export async function purgeAuthMail(
  db: PoolClient,
  key: Buffer,
  players: string[],
  now: Date,
) {
  checkMailKey(key);
  const digests = new Set(
    (
      await db.query<{ hex: string }>(
        "SELECT encode(digest,'hex') AS hex FROM account_tokens WHERE player_id=ANY($1::uuid[])",
        [players],
      )
    ).rows.map((row) => row.hex),
  );
  const legacy = digests.size
    ? (
        await db.query<SealedAuthMail>(
          "SELECT id,nonce,tag,ciphertext FROM auth_mail_outbox WHERE player_id IS NULL",
        )
      ).rows
        .filter((row) => {
          const mail = unsealAuthMail(key, row);
          const token = new URLSearchParams(
            new URL(mail.link).hash.slice(1),
          ).get(mail.purpose === "VERIFY" ? "verify" : "reset");
          return (
            !!token &&
            digests.has(createHash("sha256").update(token).digest("hex"))
          );
        })
        .map((row) => row.id)
    : [];
  const locked = await db.query<{
    id: string;
    state: string;
    lease_until: Date | null;
  }>(
    "SELECT id,state,lease_until FROM auth_mail_outbox WHERE player_id=ANY($1::uuid[]) OR id=ANY($2::uuid[]) ORDER BY id FOR UPDATE",
    [players, legacy],
  );
  if (
    locked.rows.some(
      (row) =>
        row.state === "SENDING" && row.lease_until && row.lease_until > now,
    )
  )
    throw new Fault(409, "PRIVACY_MAIL_IN_PROGRESS");
  await db.query("DELETE FROM auth_mail_outbox WHERE id=ANY($1::uuid[])", [
    locked.rows.map((row) => row.id),
  ]);
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
    const mail = unsealAuthMail(key, claim);
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

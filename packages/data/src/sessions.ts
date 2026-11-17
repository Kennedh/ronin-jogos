import {
  randomBytes,
  randomUUID,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import type { Pool } from "pg";
import { Fault, transaction, serverTime } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest();
const csrf = (secret: string) =>
  createHmac("sha256", secret).update("ronin-csrf-v1").digest("base64url");
export interface Session {
  playerId: string;
  sessionId: string;
  csrfToken: string;
  expiresAt: Date;
  locale: "pt-BR" | "en";
}
export class Sessions {
  readonly pool: Pool;
  readonly clock: Clock;
  constructor(pool: Pool, clock?: Clock) {
    this.pool = pool;
    this.clock = clock;
  }
  async read(token: string): Promise<Session> {
    const match =
      /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.([A-Za-z0-9_-]{43})$/.exec(
        token,
      );
    if (!match) throw new Fault(401, "SESSION_REQUIRED");
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      const row = (
        await db.query<{
          id: string;
          player_id: string;
          verifier_digest: Buffer;
          csrf_digest: Buffer | null;
          expires_at: Date;
          locale: Session["locale"];
        }>(
          "SELECT s.*,p.locale FROM sessions s JOIN players p ON p.id=s.player_id WHERE s.id=$1 AND s.revoked_at IS NULL AND s.expires_at>$2 AND p.status NOT IN ('DELETION_PENDING','ANONYMIZED') FOR UPDATE OF s",
          [match[1], now],
        )
      ).rows[0];
      const csrfToken = csrf(match[2]!);
      if (
        !row ||
        !timingSafeEqual(row.verifier_digest, digest(match[2]!)) ||
        !row.csrf_digest ||
        !timingSafeEqual(row.csrf_digest, digest(csrfToken))
      )
        throw new Fault(401, "SESSION_REQUIRED");
      const expiresAt = new Date(now.getTime() + 90 * 86400000);
      if (row.expires_at.getTime() - now.getTime() < 89 * 86400000) {
        await db.query("UPDATE sessions SET expires_at=$2 WHERE id=$1", [
          row.id,
          expiresAt,
        ]);
        row.expires_at = expiresAt;
      }
      return {
        playerId: row.player_id,
        sessionId: row.id,
        csrfToken,
        expiresAt: row.expires_at,
        locale: row.locale,
      };
    });
  }
  async guest(locale: Session["locale"]) {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock),
        playerId = randomUUID(),
        sessionId = randomUUID(),
        secret = randomBytes(32).toString("base64url"),
        csrfToken = csrf(secret);
      const expiresAt = new Date(now.getTime() + 90 * 86400000);
      await db.query(
        "INSERT INTO players(id,created_at,locale) VALUES($1,$2,$3)",
        [playerId, now, locale],
      );
      await db.query(
        "INSERT INTO player_regions(player_id,region_id) VALUES($1,'BAMBOO')",
        [playerId],
      );
      await db.query(
        "INSERT INTO sessions(id,player_id,verifier_digest,csrf_digest,created_at,expires_at) VALUES($1,$2,$3,$4,$5,$6)",
        [
          sessionId,
          playerId,
          digest(secret),
          digest(csrfToken),
          now,
          expiresAt,
        ],
      );
      return {
        session: { playerId, sessionId, csrfToken, expiresAt, locale },
        token: sessionId + "." + secret,
      };
    });
  }
  async summary(session: Session) {
    const regions = await this.pool.query<{ region_id: string }>(
      "SELECT region_id FROM player_regions WHERE player_id=$1 ORDER BY region_id",
      [session.playerId],
    );
    return {
      player_id: session.playerId,
      account_type: "GUEST" as const,
      nickname: null,
      locale: session.locale,
      region_unlocks: regions.rows.map((r) => r.region_id),
    };
  }
  checkCsrf(session: Session, value: string | undefined) {
    if (
      !value ||
      !/^[A-Za-z0-9_-]{43}$/.test(value) ||
      !timingSafeEqual(Buffer.from(value), Buffer.from(session.csrfToken))
    )
      throw new Fault(403, "CSRF_REQUIRED");
  }
}
/** Durable shared buckets; key material is HMACed by the API, never raw IP/cookie. */
export async function rateLimit(
  pool: Pool,
  scope: string,
  key: Buffer,
  limit: number,
  clock?: Clock,
) {
  return transaction(pool, async (db) => {
    const now = await serverTime(db, clock),
      start = new Date(Math.floor(now.getTime() / 60000) * 60000);
    await db.query(
      "DELETE FROM api_rate_buckets WHERE (scope,key_digest) IN (SELECT scope,key_digest FROM api_rate_buckets WHERE window_start<$1 LIMIT 100)",
      [new Date(start.getTime() - 120000)],
    );
    const row = (
      await db.query<{ hits: number }>(
        `INSERT INTO api_rate_buckets(scope,key_digest,window_start,hits) VALUES($1,$2,$3,1)
      ON CONFLICT(scope,key_digest) DO UPDATE SET hits=CASE WHEN api_rate_buckets.window_start=EXCLUDED.window_start THEN LEAST(api_rate_buckets.hits+1,1000000) ELSE 1 END,window_start=EXCLUDED.window_start RETURNING hits`,
        [scope, key, start],
      )
    ).rows[0]!;
    // Keep the increment even when rejecting, so failures cannot evade the bucket.
    if (row.hits > limit) throw new Fault(429, "RATE_LIMITED", true);
  });
}

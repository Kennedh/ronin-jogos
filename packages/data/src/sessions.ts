import {
  randomBytes,
  randomUUID,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { Fault, transaction, serverTime } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
import {
  nickname,
  NICKNAME_CHANGE_INTERVAL,
  reserveNickname,
} from "./nicknames.ts";
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
          status: string;
        }>(
          "SELECT s.*,p.locale,p.status FROM sessions s JOIN players p ON p.id=s.player_id WHERE s.id=$1 AND s.revoked_at IS NULL AND s.expires_at>$2 AND p.status NOT IN ('DELETION_PENDING','ANONYMIZED') FOR UPDATE OF s",
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
      const days = row.status === "REGISTERED" ? 30 : 90;
      const expiresAt = new Date(now.getTime() + days * 86400000);
      if (row.expires_at.getTime() - now.getTime() < (days - 1) * 86400000) {
        await db.query("UPDATE sessions SET expires_at=$2 WHERE id=$1", [
          row.id,
          expiresAt,
        ]);
        row.expires_at = expiresAt;
      }
      await db.query(
        "UPDATE sessions SET last_seen_at=$2 WHERE id=$1 AND last_seen_at<$3",
        [row.id, now, new Date(now.getTime() - 60000)],
      );
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
        "INSERT INTO sessions(id,player_id,verifier_digest,csrf_digest,created_at,last_seen_at,expires_at) VALUES($1,$2,$3,$4,$5,$5,$6)",
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
  async updateProfile(
    auth: Session,
    input: { nickname?: string; public_profile?: boolean },
  ) {
    await transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      const player = (
        await db.query<{
          nickname: string | null;
          nickname_changed_at: Date | null;
          public_profile: boolean;
        }>(
          "SELECT nickname,nickname_changed_at,public_profile FROM players WHERE id=$1 AND status IN ('GUEST','EMAIL_PENDING','REGISTERED') FOR UPDATE",
          [auth.playerId],
        )
      ).rows[0];
      const live = await db.query(
        "SELECT 1 FROM sessions WHERE id=$1 AND player_id=$2 AND revoked_at IS NULL AND expires_at>$3 FOR UPDATE",
        [auth.sessionId, auth.playerId, now],
      );
      if (!player || !live.rowCount) throw new Fault(401, "SESSION_REQUIRED");

      const name =
        input.nickname === undefined
          ? player.nickname
          : nickname(input.nickname);
      const changedName = name !== player.nickname;
      const isPublic = input.public_profile ?? player.public_profile;
      if (changedName && name !== null) {
        if (
          player.nickname_changed_at &&
          now.getTime() <
            player.nickname_changed_at.getTime() + NICKNAME_CHANGE_INTERVAL
        )
          throw new Fault(409, "NICKNAME_CHANGE_COOLDOWN");
        await reserveNickname(db, auth.playerId, name);
      }
      if (!changedName && isPublic === player.public_profile) return;
      await db.query(
        "UPDATE players SET nickname=$2,nickname_changed_at=$3,public_profile=$4 WHERE id=$1",
        [
          auth.playerId,
          name,
          changedName ? now : player.nickname_changed_at,
          isPublic,
        ],
      );
    });
    return this.summary(auth);
  }
  async summary(session: Session) {
    const regions = await this.pool.query<{ region_id: string }>(
      "SELECT region_id FROM player_regions WHERE player_id=$1 ORDER BY region_id",
      [session.playerId],
    );
    const p = (
      await this.pool.query(
        "SELECT p.nickname,p.nickname_changed_at,p.public_profile,p.status,a.email AS verified_email,r.email AS pending_email FROM players p LEFT JOIN email_accounts a ON a.player_id=p.id LEFT JOIN email_registrations r ON r.player_id=p.id WHERE p.id=$1",
        [session.playerId],
      )
    ).rows[0];
    return {
      player_id: session.playerId,
      account_type:
        p.status === "GUEST" ? ("GUEST" as const) : ("EMAIL" as const),
      account_status: p.status as "GUEST" | "EMAIL_PENDING" | "REGISTERED",
      nickname: p.nickname,
      public_profile: p.public_profile,
      nickname_change_available_at: p.nickname_changed_at
        ? new Date(
            p.nickname_changed_at.getTime() + NICKNAME_CHANGE_INTERVAL,
          ).toISOString()
        : null,
      locale: session.locale,
      email: p.verified_email ?? p.pending_email ?? null,
      email_verified: p.status === "REGISTERED",
      region_unlocks: regions.rows.map((r) => r.region_id),
    };
  }
  async issue(
    db: PoolClient,
    playerId: string,
    locale: Session["locale"],
    now: Date,
  ) {
    const sessionId = randomUUID(),
      secret = randomBytes(32).toString("base64url"),
      csrfToken = csrf(secret),
      expiresAt = new Date(now.getTime() + 30 * 86400000);
    await db.query(
      "INSERT INTO sessions(id,player_id,verifier_digest,csrf_digest,created_at,last_seen_at,expires_at,authenticated_at) VALUES($1,$2,$3,$4,$5,$5,$6,$5)",
      [sessionId, playerId, digest(secret), digest(csrfToken), now, expiresAt],
    );
    await db.query(
      "UPDATE sessions SET revoked_at=$2 WHERE player_id=$1 AND revoked_at IS NULL AND id IN (SELECT id FROM sessions WHERE player_id=$1 AND revoked_at IS NULL AND id<>$3 ORDER BY created_at DESC,id DESC OFFSET 19)",
      [playerId, now, sessionId],
    );
    return {
      token: sessionId + "." + secret,
      session: { playerId, sessionId, csrfToken, expiresAt, locale },
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

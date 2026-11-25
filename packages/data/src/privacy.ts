import { createHmac, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { Fault, serverTime, transaction } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
import { Sessions } from "./sessions.ts";
import type { Session } from "./sessions.ts";
import { purgeAuthMail } from "./auth-mail.ts";

const DAYS_TO_CANCEL = 7;
type Deletion = {
  requested_at: Date;
  finalize_at: Date;
  resolved_at: Date | null;
  state: "PENDING" | "CANCELLED" | "COMPLETED";
};
export const NICKNAME_REASONS = [
  "IMPERSONATION",
  "OFFENSIVE",
  "PERSONAL_DATA",
  "OTHER",
] as const;
type Reason = (typeof NICKNAME_REASONS)[number];
type Case = {
  reason: Reason;
  hidden_at: Date;
  appealed_at: Date | null;
  resolved_at: Date | null;
  state: "HIDDEN" | "APPEALED" | "RESTORED" | "UPHELD";
};
type Player = {
  id: string;
  locale: Session["locale"];
  status: string;
  nickname: string | null;
};
type ExportCursor = { after_id: string; started_through: string };

async function lockPlayer(db: PoolClient, player: string) {
  return (
    await db.query<Player>(
      "SELECT id,locale,status,nickname FROM players WHERE id=$1 FOR UPDATE",
      [player],
    )
  ).rows[0];
}
async function assertSession(
  db: PoolClient,
  auth: Session,
  now: Date,
  recent: boolean,
) {
  const live = (
    await db.query<{ authenticated_at: Date | null }>(
      "SELECT authenticated_at FROM sessions WHERE id=$1 AND player_id=$2 AND expires_at>$3 AND revoked_at IS NULL FOR UPDATE",
      [auth.sessionId, auth.playerId, now],
    )
  ).rows[0];
  if (!live) throw new Fault(401, "SESSION_REQUIRED");
  if (
    recent &&
    (!live.authenticated_at ||
      now.getTime() - live.authenticated_at.getTime() > 600_000)
  ) {
    throw new Fault(403, "REAUTH_REQUIRED");
  }
}
async function audit(db: PoolClient, player: string, event: string, now: Date) {
  await db.query(
    "INSERT INTO account_audit(id,player_id,event,created_at) VALUES($1,$2,$3,$4)",
    [randomUUID(), player, event, now],
  );
}
async function requestRow(db: PoolClient, player: string) {
  return (
    await db.query<Deletion>(
      "SELECT * FROM deletion_requests WHERE player_id=$1",
      [player],
    )
  ).rows[0];
}
function deletionStatus(row: Deletion | undefined) {
  return row
    ? {
        state: row.state,
        requested_at: row.requested_at.toISOString(),
        finalize_at: row.finalize_at.toISOString(),
        resolved_at: row.resolved_at?.toISOString() ?? null,
      }
    : null;
}
async function privacyStatus(db: PoolClient, player: string) {
  const request = await requestRow(db, player);
  const found = (
    await db.query<Case>(
      "SELECT * FROM nickname_moderation WHERE player_id=$1",
      [player],
    )
  ).rows[0];
  return {
    deletion: deletionStatus(request),
    nickname_moderation: found
      ? {
          state: found.state,
          reason: found.reason,
          hidden_at: found.hidden_at.toISOString(),
          appealed_at: found.appealed_at?.toISOString() ?? null,
          resolved_at: found.resolved_at?.toISOString() ?? null,
        }
      : null,
  };
}
async function assertClosedRuns(db: PoolClient, id: string, now: Date) {
  if (
    (
      await db.query(
        `SELECT 1 FROM runs WHERE player_id=$1 AND (
       status IN ('PENDING','VERIFYING') OR
       (status IN ('CREATED','ACTIVE') AND expires_at>=$2) OR
       (status='AWAITING_SEGMENTS' AND upload_deadline>=$2)
     ) LIMIT 1`,
        [id, now],
      )
    ).rowCount
  )
    throw new Fault(409, "PRIVACY_RUNS_IN_PROGRESS");
}

function serializeDates(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}

export class Privacy {
  private readonly pool: Pool;
  private readonly clock: Clock;
  private readonly sessions: Sessions;
  constructor(pool: Pool, clock?: Clock) {
    this.pool = pool;
    this.clock = clock;
    this.sessions = new Sessions(pool, clock);
  }

  async status(auth: Session) {
    return transaction(this.pool, async (db) => {
      await assertSession(db, auth, await serverTime(db, this.clock), false);
      return privacyStatus(db, auth.playerId);
    });
  }

  async exportPage(auth: Session, cursor?: ExportCursor) {
    return transaction(this.pool, async (db) => {
      const player = await lockPlayer(db, auth.playerId);
      const now = await serverTime(db, this.clock);
      if (
        !player ||
        !["REGISTERED", "DELETION_PENDING"].includes(player.status)
      )
        throw new Fault(403, "PRIVACY_ACCOUNT_REQUIRED");
      await assertSession(db, auth, now, true);
      const through = cursor?.started_through ?? now.toISOString();
      if (new Date(through) > now) throw new Fault(422, "INVALID_REQUEST");
      const profile = (
        await db.query(
          `SELECT p.id AS player_id,p.nickname,p.locale,p.public_profile,p.status,p.created_at, e.email, e.verified_at AS email_verified_at,
          r.email AS pending_email, g.linked_at AS google_linked_at
          FROM players p LEFT JOIN email_accounts e ON e.player_id=p.id
          LEFT JOIN email_registrations r ON r.player_id=p.id
          LEFT JOIN auth_identities g ON g.player_id=p.id AND g.provider='google' WHERE p.id=$1`,
          [player.id],
        )
      ).rows[0];
      const progress = (
        await db.query(
          `SELECT
          ARRAY(SELECT region_id FROM player_regions WHERE player_id=$1 ORDER BY region_id) AS regions,
          COALESCE((SELECT jsonb_agg(jsonb_build_object('boss_id',boss_id,'earned_at',earned_at,'run_id',source_run) ORDER BY boss_id) FROM player_boss_seals WHERE player_id=$1),'[]'::jsonb) AS seals,
          COALESCE((SELECT jsonb_agg(jsonb_build_object('reward_id',reward_id,'earned_at',earned_at,'run_id',source_run) ORDER BY reward_id) FROM player_rewards WHERE player_id=$1),'[]'::jsonb) AS rewards`,
          [player.id],
        )
      ).rows[0];
      const sessions = (
        await db.query(
          "SELECT created_at,last_seen_at,expires_at FROM sessions WHERE player_id=$1 AND revoked_at IS NULL AND expires_at>$2 ORDER BY created_at,id",
          [player.id, now],
        )
      ).rows;
      const { rows } = await db.query<{ run_id: string }>(
        `SELECT r.id AS run_id,r.mode,r.starting_region,r.started_at,r.status,r.end_reason,
           o.score::text AS score,o.real_distance::text AS real_distance_units,o.ranked,o.verified_at
         FROM runs r LEFT JOIN run_outcomes o ON o.run_id=r.id
         WHERE r.player_id=$1 AND r.started_at<=$2 AND ($3::uuid IS NULL OR r.id>$3)
         ORDER BY r.id LIMIT 201`,
        [player.id, through, cursor?.after_id ?? null],
      );
      return {
        version: 1,
        exported_at: through,
        profile: serializeDates(profile),
        progress,
        sessions: sessions.map(serializeDates),
        privacy: await privacyStatus(db, player.id),
        runs: rows.slice(0, 200).map(serializeDates),
        next_cursor:
          rows.length > 200
            ? { after_id: rows[199]!.run_id, started_through: through }
            : null,
      };
    });
  }

  async requestDeletion(auth: Session) {
    return transaction(this.pool, async (db) => {
      const p = await lockPlayer(db, auth.playerId),
        now = await serverTime(db, this.clock);
      if (!p || !["REGISTERED", "DELETION_PENDING"].includes(p.status))
        throw new Fault(403, "PRIVACY_ACCOUNT_REQUIRED");
      await assertSession(db, auth, now, true);
      if (p.status === "DELETION_PENDING") return undefined;
      await assertClosedRuns(db, p.id, now);
      await db.query(
        `INSERT INTO deletion_requests(player_id,requested_at,finalize_at,state) VALUES($1,$2,$3,'PENDING')
          ON CONFLICT(player_id) DO UPDATE SET requested_at=EXCLUDED.requested_at,finalize_at=EXCLUDED.finalize_at,state='PENDING',resolved_at=NULL`,
        [p.id, now, new Date(now.getTime() + DAYS_TO_CANCEL * 86400000)],
      );
      await db.query(
        "UPDATE players SET status='DELETION_PENDING' WHERE id=$1",
        [p.id],
      );
      await db.query(
        "UPDATE sessions SET revoked_at=$2 WHERE player_id=$1 AND revoked_at IS NULL",
        [p.id, now],
      );
      await audit(db, p.id, "DELETION_REQUESTED", now);
      return this.sessions.issue(db, p.id, p.locale, now);
    });
  }

  async cancelDeletion(auth: Session) {
    return transaction(this.pool, async (db) => {
      const p = await lockPlayer(db, auth.playerId),
        now = await serverTime(db, this.clock);
      await assertSession(db, auth, now, true);
      const row = await requestRow(db, auth.playerId);
      if (
        p?.status !== "DELETION_PENDING" ||
        row?.state !== "PENDING" ||
        row.finalize_at <= now
      )
        throw new Fault(409, "DELETION_CANNOT_CANCEL");
      await db.query(
        "UPDATE deletion_requests SET state='CANCELLED',resolved_at=$2 WHERE player_id=$1",
        [p.id, now],
      );
      await db.query("UPDATE players SET status='REGISTERED' WHERE id=$1", [
        p.id,
      ]);
      await audit(db, p.id, "DELETION_CANCELLED", now);
      return privacyStatus(db, p.id);
    });
  }

  async appeal(auth: Session) {
    return transaction(this.pool, async (db) => {
      const p = await lockPlayer(db, auth.playerId),
        now = await serverTime(db, this.clock);
      await assertSession(db, auth, now, false);
      if (!p || !["GUEST", "EMAIL_PENDING", "REGISTERED"].includes(p.status))
        throw new Fault(409, "NICKNAME_REVIEW_UNAVAILABLE");
      if (
        (
          await db.query(
            "UPDATE nickname_moderation SET state='APPEALED',appealed_at=$2 WHERE player_id=$1 AND state='HIDDEN'",
            [p.id, now],
          )
        ).rowCount
      )
        await audit(db, p.id, "NICKNAME_REVIEW_REQUESTED", now);
      return privacyStatus(db, p.id);
    });
  }

  async moderationQueue() {
    return (
      await this.pool.query(
        "SELECT player_id,reason,hidden_at,appealed_at FROM nickname_moderation WHERE state='APPEALED' ORDER BY appealed_at,player_id LIMIT 100",
      )
    ).rows;
  }

  async inspectNickname(playerId: string) {
    const match = (
      await this.pool.query<{
        nickname: string | null;
        reason: Reason;
        state: Case["state"];
      }>(
        "SELECT p.nickname,m.reason,m.state FROM nickname_moderation m JOIN players p ON p.id=m.player_id WHERE m.player_id=$1",
        [playerId],
      )
    ).rows[0];
    if (!match) throw new Fault(409, "NICKNAME_REVIEW_UNAVAILABLE");
    return match;
  }

  async moderateNickname(
    playerId: string,
    action: { hide: Reason } | { resolve: "RESTORED" | "UPHELD" },
  ) {
    return transaction(this.pool, async (db) => {
      const p = await lockPlayer(db, playerId),
        now = await serverTime(db, this.clock);
      if (
        !p?.nickname ||
        !["GUEST", "EMAIL_PENDING", "REGISTERED"].includes(p.status)
      )
        throw new Fault(409, "NICKNAME_REVIEW_UNAVAILABLE");
      const result =
        "hide" in action
          ? await db.query(
              `INSERT INTO nickname_moderation(player_id,reason,hidden_at,state) VALUES($1,$2,$3,'HIDDEN')
         ON CONFLICT(player_id) DO UPDATE SET reason=EXCLUDED.reason,hidden_at=EXCLUDED.hidden_at,state='HIDDEN',appealed_at=NULL,resolved_at=NULL
         WHERE nickname_moderation.state='RESTORED'`,
              [p.id, action.hide, now],
            )
          : await db.query(
              `UPDATE nickname_moderation SET state=$2,resolved_at=$3 WHERE player_id=$1 AND (
          state='APPEALED' OR ($2='RESTORED' AND state IN ('HIDDEN','UPHELD'))
        )`,
              [p.id, action.resolve, now],
            );
      if (!result.rowCount) throw new Fault(409, "NICKNAME_REVIEW_UNAVAILABLE");
      await audit(
        db,
        p.id,
        "hide" in action ? "NICKNAME_HIDDEN" : "NICKNAME_" + action.resolve,
        now,
      );
      return privacyStatus(db, p.id);
    });
  }

  /** One bounded maintenance operation. A second operator will lock and recheck the request. */
  async finalizeOne(mailKey: Buffer) {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      const next = (
        await db.query<{ id: string }>(
          `SELECT p.id FROM players p JOIN deletion_requests d ON d.player_id=p.id
         WHERE d.state='PENDING' AND d.finalize_at<=$1 AND p.status='DELETION_PENDING'
         ORDER BY d.finalize_at,p.id LIMIT 1 FOR UPDATE OF p SKIP LOCKED`,
          [now],
        )
      ).rows[0];
      if (!next) return false;
      const row = await requestRow(db, next.id);
      if (row?.state !== "PENDING" || row.finalize_at > now) return false;
      await assertClosedRuns(db, next.id, now);
      const merged = (
        await db.query<{ id: string }>(
          "SELECT id FROM players WHERE merged_into=$1",
          [next.id],
        )
      ).rows.map((p) => p.id);
      const involved = [next.id, ...merged];
      await purgeAuthMail(db, mailKey, involved, now);
      const emails = (
        await db.query<{ email: string }>(
          "SELECT email FROM email_accounts WHERE player_id=$1 UNION SELECT email FROM email_registrations WHERE player_id=ANY($2::uuid[])",
          [next.id, involved],
        )
      ).rows.map((e) =>
        createHmac("sha256", mailKey)
          .update("mail:" + e.email)
          .digest(),
      );
      await db.query(
        "DELETE FROM auth_email_cooldowns WHERE email_digest=ANY($1::bytea[])",
        [emails],
      );
      await db.query(
        "DELETE FROM account_merge_transactions WHERE state='PREVIEW' AND (source_player_id=ANY($1::uuid[]) OR target_player_id=ANY($1::uuid[]))",
        [involved],
      );
      await db.query(
        "DELETE FROM account_tokens WHERE player_id=ANY($1::uuid[])",
        [involved],
      );
      await db.query("DELETE FROM sessions WHERE player_id=ANY($1::uuid[])", [
        involved,
      ]);
      await db.query(
        "DELETE FROM email_registrations WHERE player_id=ANY($1::uuid[])",
        [involved],
      );
      await db.query("DELETE FROM password_credentials WHERE player_id=$1", [
        next.id,
      ]);
      await db.query("DELETE FROM email_accounts WHERE player_id=$1", [
        next.id,
      ]);
      await db.query("DELETE FROM auth_identities WHERE player_id=$1", [
        next.id,
      ]);
      await db.query("DELETE FROM nickname_reservations WHERE player_id=$1", [
        next.id,
      ]);
      await db.query("DELETE FROM nickname_moderation WHERE player_id=$1", [
        next.id,
      ]);
      await db.query(
        "DELETE FROM run_start_keys WHERE player_id=ANY($1::uuid[])",
        [involved],
      );
      await db.query(
        "UPDATE players SET status='ANONYMIZED',nickname=NULL,nickname_changed_at=NULL,public_profile=false,locale='en' WHERE id=$1",
        [next.id],
      );
      await db.query(
        "UPDATE deletion_requests SET state='COMPLETED',resolved_at=$2 WHERE player_id=$1",
        [next.id, now],
      );
      await audit(db, next.id, "ACCOUNT_ANONYMIZED", now);
      await db.query(
        "INSERT INTO outbox_events(event_key,type,payload,created_at) VALUES($1,'PLAYER_ANONYMIZED',$2,$3)",
        [
          "player-anonymized:" + next.id,
          JSON.stringify({ player_id: next.id }),
          now,
        ],
      );
      return true;
    });
  }
}

import { randomBytes, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { Fault, serverTime, transaction } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
import { digest, Sessions } from "./sessions.ts";
import type { Session } from "./sessions.ts";
import { consumeGoogleChallenge } from "./google-challenges.ts";
import type { GoogleCredential } from "./google-challenges.ts";

type Proof =
  | { method: "EMAIL"; playerId: string; passwordDigest: Buffer }
  | { method: "GOOGLE"; credential: GoogleCredential };

type Player = {
  id: string;
  status: string;
  nickname: string | null;
  locale: Session["locale"];
};

type Merge = {
  id: string;
  source_player_id: string;
  source_session_id: string;
  target_player_id: string;
  proof_method: Proof["method"];
  proof_digest: Buffer | null;
  preview_digest: Buffer | null;
  expires_at: Date;
  state: "PREVIEW" | "APPLYING" | "COMPLETED";
};

async function lockedPlayers(db: PoolClient, source: string, target: string) {
  const { rows } = await db.query<Player>(
    "SELECT id,status,nickname,locale FROM players WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
    [[source, target]],
  );
  return {
    source: rows.find((player) => player.id === source),
    target: rows.find((player) => player.id === target),
  };
}

async function assertLive(db: PoolClient, auth: Session, now: Date) {
  const live = await db.query(
    "SELECT 1 FROM sessions WHERE id=$1 AND player_id=$2 AND revoked_at IS NULL AND expires_at>$3 FOR UPDATE",
    [auth.sessionId, auth.playerId, now],
  );
  if (!live.rowCount) throw new Fault(401, "SESSION_REQUIRED");
}

function assertEligible(
  source: Player | undefined,
  target: Player | undefined,
) {
  if (
    !source ||
    !target ||
    source.id === target.id ||
    !["GUEST", "EMAIL_PENDING"].includes(source.status) ||
    target.status !== "REGISTERED"
  )
    throw new Fault(409, "MERGE_NOT_AVAILABLE");
}

async function assertNoOpenRuns(db: PoolClient, source: string, now: Date) {
  const open = await db.query(
    `SELECT 1 FROM runs WHERE player_id=$1 AND (
      status IN ('PENDING','VERIFYING') OR
      (status IN ('CREATED','ACTIVE') AND expires_at>=$2) OR
      (status='AWAITING_SEGMENTS' AND upload_deadline>=$2)
    ) LIMIT 1`,
    [source, now],
  );
  if (open.rowCount) throw new Fault(409, "MERGE_RUNS_IN_PROGRESS");
}

async function summarize(db: PoolClient, player: Player) {
  const { rows } = await db.query<{
    runs: number;
    verified: number;
    best_ranked_score: string | null;
    regions: string[];
    seals: string[];
    rewards: string[];
  }>(
    `SELECT
       (SELECT count(*)::int FROM runs WHERE player_id=$1) AS runs,
       (SELECT count(*)::int FROM run_outcomes WHERE player_id=$1) AS verified,
       (SELECT max(score)::text FROM run_outcomes WHERE player_id=$1 AND ranked) AS best_ranked_score,
       ARRAY(SELECT region_id FROM player_regions WHERE player_id=$1 ORDER BY region_id) AS regions,
       ARRAY(SELECT boss_id FROM player_boss_seals WHERE player_id=$1 ORDER BY boss_id) AS seals,
       ARRAY(SELECT reward_id FROM player_rewards WHERE player_id=$1 ORDER BY reward_id) AS rewards`,
    [player.id],
  );
  return { nickname: player.nickname, ...rows[0]! };
}

async function methodFingerprint(
  db: PoolClient,
  playerId: string,
  method: Proof["method"],
) {
  if (method === "EMAIL") {
    const found = (
      await db.query<{ digest: Buffer }>(
        "SELECT digest FROM password_credentials WHERE player_id=$1",
        [playerId],
      )
    ).rows[0];
    return found ? digest("email:" + found.digest.toString("hex")) : undefined;
  }
  const found = (
    await db.query<{ subject: string; linked_at: Date }>(
      "SELECT subject,linked_at FROM auth_identities WHERE provider='google' AND player_id=$1",
      [playerId],
    )
  ).rows[0];
  return found
    ? digest("google:" + found.subject + ":" + found.linked_at.toISOString())
    : undefined;
}

async function applyProgress(
  db: PoolClient,
  source: string,
  target: string,
  now: Date,
) {
  // Stale local tickets can never be resumed. In-flight verification blocks the merge.
  await db.query(
    `UPDATE runs SET status='EXPIRED' WHERE player_id=$1 AND (
      (status IN ('CREATED','ACTIVE') AND expires_at<$2) OR
      (status='AWAITING_SEGMENTS' AND upload_deadline<$2)
    )`,
    [source, now],
  );
  // Keep the destination's existing provenance for an already-earned seal or reward.
  await db.query(
    "DELETE FROM player_boss_seals s USING player_boss_seals t WHERE s.player_id=$1 AND t.player_id=$2 AND s.boss_id=t.boss_id",
    [source, target],
  );
  await db.query(
    "DELETE FROM player_rewards s USING player_rewards t WHERE s.player_id=$1 AND t.player_id=$2 AND s.reward_id=t.reward_id",
    [source, target],
  );
  // FK cascades move the verified outcome and its dependent evidence in the same statement.
  await db.query(
    "UPDATE runs SET player_id=$2,original_player_id=$1 WHERE player_id=$1",
    [source, target],
  );
  await db.query(
    "INSERT INTO player_regions(player_id,region_id) SELECT $2,region_id FROM player_regions WHERE player_id=$1 ON CONFLICT DO NOTHING",
    [source, target],
  );
  await db.query("DELETE FROM player_regions WHERE player_id=$1", [source]);
  await db.query(
    `WITH seals AS (
      SELECT source_run,count(*) OVER () AS total FROM player_boss_seals
      WHERE player_id=$1 ORDER BY earned_at DESC,boss_id LIMIT 1
    )
    INSERT INTO player_rewards(player_id,reward_id,source_run,earned_at)
    SELECT $1,reward,source_run,$2 FROM seals
    CROSS JOIN (VALUES ('AURORA_TRAIL'),('FOUR_PATHS_GUARDIAN')) AS rewards(reward)
    WHERE total=4 ON CONFLICT DO NOTHING`,
    [target, now],
  );
}

export class Merges {
  private readonly sessions: Sessions;
  private readonly pool: Pool;
  private readonly clock: Clock;
  constructor(pool: Pool, clock?: Clock) {
    this.pool = pool;
    this.clock = clock;
    this.sessions = new Sessions(pool, clock);
  }

  async preview(auth: Session, proof: Proof) {
    return transaction(this.pool, async (db) => {
      const googleOwner = async (subject: string) =>
        (
          await db.query<{ player_id: string }>(
            "SELECT player_id FROM auth_identities WHERE provider='google' AND subject=$1",
            [subject],
          )
        ).rows[0]?.player_id;
      const targetId =
        proof.method === "EMAIL"
          ? proof.playerId
          : await googleOwner(proof.credential.subject);
      if (!targetId) throw new Fault(401, "INVALID_CREDENTIALS");
      const { source, target } = await lockedPlayers(
        db,
        auth.playerId,
        targetId,
      );
      const now = await serverTime(db, this.clock);
      await assertLive(db, auth, now);
      assertEligible(source, target);
      const fingerprint = await methodFingerprint(db, targetId, proof.method);
      if (!fingerprint) throw new Fault(401, "INVALID_CREDENTIALS");
      if (proof.method === "EMAIL") {
        if (
          !fingerprint.equals(
            digest("email:" + proof.passwordDigest.toString("hex")),
          )
        )
          throw new Fault(401, "INVALID_CREDENTIALS");
      } else {
        if ((await googleOwner(proof.credential.subject)) !== targetId)
          throw new Fault(401, "INVALID_CREDENTIALS");
        await consumeGoogleChallenge(
          db,
          auth.sessionId,
          "MERGE",
          proof.credential,
          now,
        );
      }
      await assertNoOpenRuns(db, auth.playerId, now);
      const summary = {
        source: await summarize(db, source!),
        target: await summarize(db, target!),
      };
      const nonce = randomBytes(32).toString("base64url"),
        expiresAt = new Date(now.getTime() + 300_000);
      await db.query(
        "DELETE FROM account_merge_transactions WHERE id IN (SELECT id FROM account_merge_transactions WHERE state='PREVIEW' AND expires_at<=$1 LIMIT 100 FOR UPDATE SKIP LOCKED)",
        [now],
      );
      await db.query(
        "DELETE FROM account_merge_transactions WHERE state='PREVIEW' AND source_session_id=$1",
        [auth.sessionId],
      );
      await db.query(
        `INSERT INTO account_merge_transactions(id,source_player_id,source_session_id,target_player_id,nonce_digest,proof_method,proof_digest,preview_digest,created_at,expires_at,state)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'PREVIEW')`,
        [
          randomUUID(),
          auth.playerId,
          auth.sessionId,
          targetId,
          digest(nonce),
          proof.method,
          fingerprint,
          digest(JSON.stringify(summary)),
          now,
          expiresAt,
        ],
      );
      return {
        merge_nonce: nonce,
        source_player_id: auth.playerId,
        target_player_id: targetId,
        expires_at: expiresAt.toISOString(),
        summary,
      };
    });
  }

  async confirm(auth: Session, nonce: string) {
    const key = digest(nonce);
    return transaction(this.pool, async (db) => {
      const hint = (
        await db.query<Merge>(
          "SELECT * FROM account_merge_transactions WHERE nonce_digest=$1",
          [key],
        )
      ).rows[0];
      if (
        !hint ||
        (auth.sessionId !== hint.source_session_id &&
          auth.playerId !== hint.target_player_id)
      )
        throw new Fault(409, "MERGE_PROOF_INVALID");

      const { source, target } = await lockedPlayers(
        db,
        hint.source_player_id,
        hint.target_player_id,
      );
      const now = await serverTime(db, this.clock);
      await assertLive(db, auth, now);
      const merge = (
        await db.query<Merge>(
          "SELECT * FROM account_merge_transactions WHERE id=$1 FOR UPDATE",
          [hint.id],
        )
      ).rows[0];
      if (
        merge?.state === "COMPLETED" &&
        auth.playerId === merge.target_player_id
      )
        return undefined; // Keep the current verified destination session on a repeated request.
      if (
        !merge ||
        merge.state !== "PREVIEW" ||
        auth.sessionId !== merge.source_session_id ||
        auth.playerId !== merge.source_player_id ||
        merge.expires_at <= now
      )
        throw new Fault(409, "MERGE_PROOF_INVALID");

      assertEligible(source, target);
      const proof = await methodFingerprint(
        db,
        merge.target_player_id,
        merge.proof_method,
      );
      if (!proof || !merge.proof_digest?.equals(proof))
        throw new Fault(409, "MERGE_PROOF_INVALID");
      await assertNoOpenRuns(db, merge.source_player_id, now);
      const summary = {
        source: await summarize(db, source!),
        target: await summarize(db, target!),
      };
      if (!merge.preview_digest?.equals(digest(JSON.stringify(summary))))
        throw new Fault(409, "MERGE_PREVIEW_CHANGED");

      await db.query(
        "UPDATE account_merge_transactions SET state='APPLYING' WHERE id=$1",
        [merge.id],
      );
      await applyProgress(
        db,
        merge.source_player_id,
        merge.target_player_id,
        now,
      );
      await db.query("DELETE FROM nickname_reservations WHERE player_id=$1", [
        merge.source_player_id,
      ]);
      await db.query("DELETE FROM email_registrations WHERE player_id=$1", [
        merge.source_player_id,
      ]);
      await db.query(
        "UPDATE account_tokens SET used_at=$2 WHERE player_id=$1 AND used_at IS NULL",
        [merge.source_player_id, now],
      );
      await db.query(
        "UPDATE sessions SET revoked_at=$2 WHERE player_id=$1 AND revoked_at IS NULL",
        [merge.source_player_id, now],
      );
      await db.query(
        "UPDATE players SET status='MERGED',merged_into=$2,nickname=NULL,nickname_changed_at=NULL,public_profile=false WHERE id=$1",
        [merge.source_player_id, merge.target_player_id],
      );
      await db.query(
        "UPDATE account_merge_transactions SET state='COMPLETED',completed_at=$2,proof_digest=NULL,preview_digest=NULL WHERE id=$1",
        [merge.id, now],
      );
      await db.query(
        "DELETE FROM account_merge_transactions WHERE source_player_id=$1 AND state='PREVIEW'",
        [merge.source_player_id],
      );
      await db.query(
        "INSERT INTO account_audit(id,player_id,event,created_at) VALUES($1,$2,'GUEST_PROGRESS_MERGED',$3)",
        [merge.id, merge.target_player_id, now],
      );
      // Preserve the original verified event payload. Future projections resolve ownership from run_outcomes.
      await db.query(
        "INSERT INTO outbox_events(event_key,type,payload,created_at) VALUES($1,'PLAYER_MERGED',$2,$3)",
        [
          "player-merged:" + merge.id,
          JSON.stringify({
            source_player_id: merge.source_player_id,
            target_player_id: merge.target_player_id,
          }),
          now,
        ],
      );
      return this.sessions.issue(
        db,
        merge.target_player_id,
        target!.locale,
        now,
      );
    });
  }
}

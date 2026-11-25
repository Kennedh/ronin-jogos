import type { Pool, PoolClient } from "pg";
import {
  characterParts,
  defaultAppearance,
  partsById,
  resolveAppearance,
} from "@ronin/content/character";
import type { Appearance } from "@ronin/content/character";
import { Fault, transaction, serverTime } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
import type { Session } from "./sessions.ts";

export async function readCharacter(db: PoolClient, playerId: string) {
  const row = (
    await db.query<{ appearance_version: number; slots: Appearance }>(
      "SELECT appearance_version, slots FROM player_character_profiles WHERE player_id=$1",
      [playerId],
    )
  ).rows[0];
  return {
    player_id: playerId,
    appearance_version: row?.appearance_version ?? 1,
    slots: row ? resolveAppearance(row.slots) : { ...defaultAppearance },
  };
}
async function ownedParts(db: PoolClient, playerId: string) {
  const evidence = await db.query<{ id: string }>(
    `SELECT reward_id AS id FROM player_rewards WHERE player_id=$1
    UNION ALL SELECT boss_id FROM player_boss_seals WHERE player_id=$1`,
    [playerId],
  );
  const earned = new Set(evidence.rows.map((row) => row.id));
  return characterParts
    .filter(
      (part) => part.is_basic_free || earned.has(part.unlock_requirement_id!),
    )
    .map((part) => part.part_id);
}
export class Characters {
  private readonly pool: Pool;
  private readonly clock: Clock;
  constructor(pool: Pool, clock?: Clock) {
    this.pool = pool;
    this.clock = clock;
  }
  get(playerId: string) {
    return transaction(this.pool, (db) => readCharacter(db, playerId));
  }
  inventory(playerId: string) {
    return transaction(this.pool, async (db) => ({
      equipped: await readCharacter(db, playerId),
      unlocked_part_ids: await ownedParts(db, playerId),
    }));
  }
  update(
    auth: Session,
    expected: number | undefined,
    changes: Record<string, string>,
  ) {
    return transaction(this.pool, async (db) => {
      const player = (
        await db.query<{ status: string }>(
          "SELECT status FROM players WHERE id=$1 FOR UPDATE",
          [auth.playerId],
        )
      ).rows[0];
      const now = await serverTime(db, this.clock);
      const live = await db.query(
        "SELECT 1 FROM sessions WHERE id=$1 AND player_id=$2 AND revoked_at IS NULL AND expires_at>$3 FOR UPDATE",
        [auth.sessionId, auth.playerId, now],
      );
      if (!live.rowCount || !player) throw new Fault(401, "SESSION_REQUIRED");
      if (!["GUEST", "EMAIL_PENDING", "REGISTERED"].includes(player.status))
        throw new Fault(409, "ACCOUNT_DELETION_PENDING");
      const current = await readCharacter(db, auth.playerId);
      const allowed = new Set(await ownedParts(db, auth.playerId));
      const slots = { ...current.slots };
      let dirty = false;
      for (const [slot, id] of Object.entries(changes)) {
        const part = partsById.get(id);
        if (!part || part.slot !== slot)
          throw new Fault(422, "INVALID_REQUEST");
        if (!allowed.has(id)) throw new Fault(403, "COSMETIC_LOCKED");
        if (slots[part.slot] !== id) {
          slots[part.slot] = id;
          dirty = true;
        }
      }
      if (!dirty) return current;
      if (expected !== undefined && expected !== current.appearance_version)
        throw new Fault(409, "APPEARANCE_CONFLICT");
      const version = current.appearance_version + 1;
      await db.query(
        `INSERT INTO player_character_profiles(player_id,appearance_version,slots) VALUES($1,$2,$3)
        ON CONFLICT(player_id) DO UPDATE SET appearance_version=EXCLUDED.appearance_version,slots=EXCLUDED.slots`,
        [auth.playerId, version, slots],
      );
      return { ...current, appearance_version: version, slots };
    });
  }
}

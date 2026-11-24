import type { PoolClient } from "pg";
import { Fault } from "./runtime.ts";

export const NICKNAME_CHANGE_INTERVAL = 30 * 86_400_000;

export function nickname(value: string) {
  const name = value.normalize("NFKC").trim().replace(/ +/g, " ");
  if (
    Array.from(name).length < 3 ||
    Array.from(name).length > 20 ||
    !/^[\p{L}\p{N} _-]+$/u.test(name) ||
    [
      "ronin",
      "admin",
      "administrator",
      "administrador",
      "support",
      "suporte",
      "moderator",
    ].includes(name.toLowerCase())
  )
    throw new Fault(422, "INVALID_NICKNAME");
  return name;
}

/** Caller holds the player row lock. Losing a claim leaves the old reservation intact. */
export async function reserveNickname(
  db: PoolClient,
  playerId: string,
  name: string,
) {
  try {
    await db.query(
      `INSERT INTO nickname_reservations(normalized_name,player_id) VALUES($1,$2)
       ON CONFLICT(player_id) DO UPDATE SET normalized_name=EXCLUDED.normalized_name`,
      [name.toLowerCase(), playerId],
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "constraint" in error &&
      error.constraint === "nickname_reservations_pkey"
    )
      throw new Fault(409, "NICKNAME_UNAVAILABLE");
    throw error;
  }
}

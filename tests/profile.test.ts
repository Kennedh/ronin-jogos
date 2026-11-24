import assert from "node:assert/strict";
import { test } from "node:test";
import { migrate } from "@ronin/data";
import { testPostgres } from "./helpers/postgres.ts";
import { harness } from "./helpers/runtime.ts";
import type { Client } from "./helpers/runtime.ts";

test(
  "Ronin ID profile: guest ownership, atomic nickname claims and 30-day changes",
  { timeout: 120000 },
  async () => {
    const db = await testPostgres();
    try {
      await migrate(db.pool);
      let now = Date.now();
      const { api, guest, headers, start } = harness(
        db.pool,
        () => new Date(now),
      );
      try {
        const first = await guest();
        const second = await guest();
        const patch = (player: Client, payload: Record<string, unknown>) =>
          api.inject({
            method: "PATCH",
            url: "/api/v1/me",
            headers: headers(player),
            payload,
          });
        const profile = async (player: Client) => {
          const res = await api.inject({
            method: "GET",
            url: "/api/v1/me",
            headers: headers(player),
          });
          assert.equal(res.statusCode, 200, res.body);
          return res.json();
        };

        assert.equal((await profile(first)).public_profile, false);
        assert.equal((await profile(first)).nickname_change_available_at, null);
        const run = await start(first);
        assert.equal(
          (await patch(first, { nickname: "Admin" })).statusCode,
          422,
        );
        assert.equal(
          (
            await patch(first, {
              player_id: second.playerId,
              public_profile: true,
            })
          ).statusCode,
          422,
        );
        assert.equal(
          (await patch(first, { public_profile: "true" })).statusCode,
          422,
        );
        assert.equal(
          (
            await api.inject({
              method: "PATCH",
              url: "/api/v1/me",
              headers: { ...headers(first), "x-csrf-token": "" },
              payload: { public_profile: true },
            })
          ).statusCode,
          403,
        );
        const competing = await Promise.all([
          patch(first, { nickname: "  Ｆalcão  " }),
          patch(second, { nickname: "FALCÃO" }),
        ]);
        assert.deepEqual(
          competing.map((response) => response.statusCode).sort(),
          [200, 409],
        );
        const winner = competing[0]!.statusCode === 200 ? first : second;
        const loser = winner === first ? second : first;
        assert.equal(
          competing.find((r) => r.statusCode === 409)!.json().error.code,
          "NICKNAME_UNAVAILABLE",
        );
        const saved = await profile(winner);
        assert.equal(saved.nickname.toLowerCase(), "falcão");
        assert.equal(saved.player_id, winner.playerId);
        assert.equal((await profile(loser)).nickname, null);
        assert.equal(
          (await patch(loser, { nickname: "Outro Ronin" })).statusCode,
          200,
        );

        const due = Date.parse(saved.nickname_change_available_at);
        assert.equal(due, now + 30 * 86_400_000);
        now = due - 1;
        const blocked = await patch(winner, {
          nickname: "Vento Norte",
          public_profile: true,
        });
        assert.equal(blocked.statusCode, 409);
        assert.equal(blocked.json().error.code, "NICKNAME_CHANGE_COOLDOWN");
        assert.equal((await profile(winner)).public_profile, false);
        const toggled = await patch(winner, { public_profile: true });
        assert.equal(toggled.statusCode, 200);
        assert.equal(toggled.json().public_profile, true);
        assert.equal(
          toggled.json().nickname_change_available_at,
          saved.nickname_change_available_at,
        );

        now++;
        const conflict = await patch(winner, { nickname: "outro ronin" });
        assert.equal(conflict.statusCode, 409);
        assert.equal((await profile(winner)).nickname, saved.nickname);
        const moved = await patch(winner, {
          nickname: "Vento Norte",
          public_profile: false,
        });
        assert.equal(moved.statusCode, 200, moved.body);
        assert.equal(moved.json().nickname, "Vento Norte");
        assert.equal(moved.json().public_profile, false);
        assert.equal(
          (
            await db.pool.query(
              "SELECT count(*) AS n FROM nickname_reservations WHERE normalized_name='falcão'",
            )
          ).rows[0].n,
          "0",
        );
        assert.equal(
          (
            await db.pool.query("SELECT player_id FROM runs WHERE id=$1", [
              run.run_id,
            ])
          ).rows[0].player_id,
          first.playerId,
        );
      } finally {
        await api.close();
      }
    } finally {
      await db.close();
    }
  },
);

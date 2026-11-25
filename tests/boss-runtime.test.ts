import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testPostgres } from "./helpers/postgres.ts";
import { harness, part } from "./helpers/runtime.ts";
import { migrate, VerificationQueue } from "@ronin/data";
import { BOSS_MANIFEST } from "@ronin/content/runner-manifest";
import { bossRun } from "./fixtures/boss-run.ts";
import { RULES_V4, control } from "@ronin/runner-core";
import { runOnce } from "@ronin/verifier";
import { segmentHash } from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
import { stateHash } from "@ronin/contracts/canonical";
test(
  "4: verified boss ledger, concurrent seals/Aurora, rollback, retry and private API",
  { timeout: 180000 },
  async () => {
    const db = await testPostgres();
    await migrate(db.pool);
    let now = Date.parse("2026-11-18T12:00:00Z");
    const h = harness(db.pool, () => new Date(now), undefined, BOSS_MANIFEST);
    try {
      const owner = await h.guest(),
        outsider = await h.guest();
      const progress = async (client = owner) => {
        const r = await h.api.inject({
          url: "/api/v1/me/bosses",
          headers: h.headers(client),
        });
        assert.equal(r.statusCode, 200, r.body);
        return r.json();
      };
      assert.deepEqual(await progress(), { seals: [], rewards: [] });
      const post = async (
        fight: boolean,
        regional = false,
        target = owner,
        region = "TEMPLE",
      ) => {
        const ticket = await h.start(
          target,
          randomUUID(),
          regional ? { mode: "REGIONAL", region_id: region } : { mode: "FULL" },
        );
        assert.equal(ticket.versions.rules_major, 4);
        const run = bossRun(
            ticket.seed,
            RULES_V4,
            regional
              ? ({
                  BAMBOO: 60000000,
                  TEMPLE: 80000000,
                  MOUNTAINS: 100000000,
                  CASTLE: 80000000,
                }[region] ?? 80000000)
              : 320000000,
            ticket.starting_region_id,
            fight,
          ),
          state = control(run.state, "QUIT");
        now += Math.ceil((state.tick / 60) * 1000) + 1000;
        let hash: string | null = null,
          index = 0;
        for (let start = 0; start < state.tick; start += 3600) {
          const end = Math.min(state.tick, start + 3600),
            s: ReplaySegment = {
              protocol: "rr-input-v1",
              run_id: ticket.run_id,
              index: index++,
              start_tick: start,
              end_tick: end,
              previous_hash: hash,
              actions: run.commands.filter(
                (c) => c.tick >= start && c.tick < end,
              ),
              controls:
                end === state.tick
                  ? [{ tick: end, sequence: 0, action: "QUIT" }]
                  : [],
            };
          const res = await h.upload(target, s);
          assert.equal(res.statusCode, 201, res.body);
          hash = await segmentHash(s);
        }
        const res = await h.api.inject({
          method: "POST",
          url: `/api/v1/runs/${ticket.run_id}/finish`,
          headers: h.headers(target),
          payload: {
            final_segment_index: index - 1,
            final_tick: state.tick,
            final_hash: hash,
            end_reason: "QUIT",
          },
        });
        assert.ok([200, 202].includes(res.statusCode), res.body);
        return { ticket, state, run };
      };
      const first = await post(true);
      assert.deepEqual(await progress(), { seals: [], rewards: [] });
      const queue = new VerificationQueue(db.pool, () => new Date(now));
      await db.pool.query(
        "CREATE FUNCTION qa_boss_failure() RETURNS trigger LANGUAGE plpgsql AS $f$ BEGIN RAISE EXCEPTION 'qa_boss_failure'; END $f$; CREATE TRIGGER qa_boss_failure BEFORE INSERT ON outbox_events FOR EACH ROW EXECUTE FUNCTION qa_boss_failure()",
      );
      assert.equal(await runOnce(queue), "RETRY");
      for (const table of [
        "run_outcomes",
        "run_boss_outcomes",
        "player_boss_seals",
        "player_rewards",
      ])
        assert.equal(
          (await db.pool.query(`SELECT count(*) AS n FROM ${table}`)).rows[0].n,
          "0",
        );
      await db.pool.query(
        "DROP TRIGGER qa_boss_failure ON outbox_events; DROP FUNCTION qa_boss_failure()",
      );
      now += 2000;
      const lease = await queue.claim();
      assert.ok(lease);
      const { verifyLease } = await import("@ronin/verifier");
      assert.equal(await verifyLease(queue, lease), "VERIFIED");
      const row = (
        await db.pool.query("SELECT * FROM run_outcomes WHERE run_id=$1", [
          first.ticket.run_id,
        ])
      ).rows[0];
      assert.equal(row.state_hash, await stateHash(first.state));
      assert.equal(row.score, first.state.score);
      assert.equal(row.ranked, false);
      const completed = await h.status(owner, first.ticket.run_id);
      assert.equal(completed.boss_results!.length, 4);
      assert.equal(
        completed.boss_results!.reduce((s, b) => s + Number(b.bonus), 0),
        2250,
      );
      const earned = await progress();
      assert.deepEqual(earned.seals, ["B01", "B02", "B03", "B04"]);
      assert.ok(earned.rewards.includes("AURORA_TRAIL"));
      assert.ok(earned.rewards.includes("PATH_LEGEND"));
      const equip = await h.api.inject({
        method: "PATCH",
        url: "/api/v1/me/character",
        headers: h.headers(owner),
        payload: {
          expected_appearance_version: 1,
          slots: {
            slash_effect_id: "trail_aurora",
            profile_emblem_id: "seal_castle",
          },
        },
      });
      assert.equal(equip.statusCode, 200, equip.body);
      assert.equal(equip.json().slots.slash_effect_id, "trail_aurora");
      assert.deepEqual(await progress(outsider), { seals: [], rewards: [] });
      await queue.complete(lease, {
        score: first.state.score,
        distance: first.state.distance,
        activeTicks: first.state.tick,
        endReason: "QUIT",
        stateHash: await stateHash(first.state),
        bosses: first.run.outcomes,
      });
      assert.equal(
        (await db.pool.query("SELECT count(*) AS n FROM run_boss_outcomes"))
          .rows[0].n,
        "4",
      );
      await post(true, true);
      await post(false);
      assert.deepEqual(await Promise.all([runOnce(queue), runOnce(queue)]), [
        "VERIFIED",
        "VERIFIED",
      ]);
      assert.equal(
        (await db.pool.query("SELECT count(*) AS n FROM player_boss_seals"))
          .rows[0].n,
        "4",
      );
      assert.equal(
        (
          await db.pool.query(
            "SELECT count(*) AS n FROM player_rewards WHERE reward_id='AURORA_TRAIL'",
          )
        ).rows[0].n,
        "1",
      );
      assert.equal(
        (
          await db.pool.query(
            "SELECT count(*) AS n FROM run_boss_outcomes WHERE result='RETREATED' AND bonus=0",
          )
        ).rows[0].n,
        "4",
      );
      // Separate first-time grants: four regional wins across sessions, last two verify concurrently.
      const cumulative = await h.guest();
      await post(false, false, cumulative);
      assert.equal(await runOnce(queue), "VERIFIED");
      await post(true, true, cumulative, "BAMBOO");
      await post(true, true, cumulative, "TEMPLE");
      assert.deepEqual(await Promise.all([runOnce(queue), runOnce(queue)]), [
        "VERIFIED",
        "VERIFIED",
      ]);
      assert.equal((await progress(cumulative)).seals.length, 2);
      await post(true, true, cumulative, "MOUNTAINS");
      await post(true, true, cumulative, "CASTLE");
      assert.deepEqual(await Promise.all([runOnce(queue), runOnce(queue)]), [
        "VERIFIED",
        "VERIFIED",
      ]);
      const combined = await progress(cumulative);
      assert.equal(combined.seals.length, 4);
      assert.ok(combined.rewards.includes("AURORA_TRAIL"));
      assert.equal(combined.rewards.includes("PATH_LEGEND"), false);
      assert.equal(
        (
          await db.pool.query(
            "SELECT count(*) AS n FROM player_rewards WHERE player_id=$1 AND reward_id='AURORA_TRAIL'",
            [cumulative.playerId],
          )
        ).rows[0].n,
        "1",
      );
      // A malicious client cannot assert a boss victory or mint a reward in finish/progress.
      const bad = await h.start(outsider),
        s = part(bad, 1);
      s.controls = [{ tick: 1, sequence: 0, action: "QUIT" }];
      assert.equal((await h.upload(outsider, s)).statusCode, 201);
      const injected = await h.api.inject({
        method: "POST",
        url: `/api/v1/runs/${bad.run_id}/finish`,
        headers: h.headers(outsider),
        payload: {
          final_segment_index: 0,
          final_tick: 1,
          final_hash: await segmentHash(s),
          end_reason: "QUIT",
          boss_defeated: true,
        },
      });
      assert.equal(injected.statusCode, 422);
      assert.ok(
        [200, 202].includes((await h.finish(outsider, s, "ABYSS")).statusCode),
      );
      assert.equal(await runOnce(queue), "REJECTED");
      assert.deepEqual(await progress(outsider), { seals: [], rewards: [] });
      assert.equal(
        (await h.api.inject({ url: "/api/v1/me/bosses" })).statusCode,
        403,
      );
    } finally {
      await h.api.close();
      await db.close();
    }
  },
);

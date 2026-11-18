import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testPostgres } from "./helpers/postgres.ts";
import { harness, part } from "./helpers/runtime.ts";
import { migrate, VerificationQueue } from "@ronin/data";
import { DIRECTOR_MANIFEST } from "@ronin/content/runner-manifest";
import { directorRun } from "./fixtures/director-run.ts";
import { control } from "@ronin/runner-core";
import { runOnce } from "@ronin/verifier";
import { segmentHash } from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
import { stateHash } from "@ronin/contracts/canonical";
test(
  "3: five full cycles stream through API/worker and unlock regions only in the verified transaction",
  { timeout: 180000 },
  async () => {
    const db = await testPostgres();
    await migrate(db.pool);
    let now = Date.parse("2026-11-18T12:00:00Z");
    const h = harness(
      db.pool,
      () => new Date(now),
      undefined,
      DIRECTOR_MANIFEST,
    );
    try {
      const client = await h.guest();
      const locked = await h.api.inject({
        method: "POST",
        url: "/api/v1/runs/start",
        headers: { ...h.headers(client), "idempotency-key": randomUUID() },
        payload: { mode: "REGIONAL", region_id: "TEMPLE" },
      });
      assert.equal(locked.statusCode, 403);
      const ticket = await h.start(client);
      assert.equal(ticket.versions.rules_major, 3);
      const run = directorRun(
          ticket.seed,
          DIRECTOR_MANIFEST.physics,
          1600000000,
        ),
        state = control(run.state, "QUIT");
      now += Math.ceil((state.tick / 60) * 1000) + 1000;
      let hash: string | null = null,
        index = 0;
      for (let start = 0; start < state.tick; start += 3600) {
        const end = Math.min(state.tick, start + 3600),
          segment: ReplaySegment = {
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
        const response = await h.upload(client, segment);
        assert.equal(response.statusCode, 201, response.body);
        hash = await segmentHash(segment);
      }
      const before = await h.api.inject({
        url: "/api/v1/me/regions",
        headers: h.headers(client),
      });
      assert.equal(before.statusCode, 200);
      assert.deepEqual(before.json().unlocked_regions, ["BAMBOO"]);
      const finish = await h.api.inject({
        method: "POST",
        url: `/api/v1/runs/${ticket.run_id}/finish`,
        headers: h.headers(client),
        payload: {
          final_segment_index: index - 1,
          final_tick: state.tick,
          final_hash: hash,
          end_reason: "QUIT",
        },
      });
      assert.ok([200, 202].includes(finish.statusCode), finish.body);
      const queue = new VerificationQueue(db.pool, () => new Date(now));
      await db.pool.query(
        "CREATE FUNCTION qa_director_rollback() RETURNS trigger LANGUAGE plpgsql AS $fn$ BEGIN RAISE EXCEPTION 'qa_director_rollback'; END $fn$; CREATE TRIGGER qa_director_rollback BEFORE INSERT ON outbox_events FOR EACH ROW EXECUTE FUNCTION qa_director_rollback()",
      );
      assert.equal(await runOnce(queue), "RETRY");
      assert.equal(
        Number(
          (await db.pool.query("SELECT count(*) AS n FROM run_outcomes"))
            .rows[0].n,
        ),
        0,
      );
      assert.deepEqual(
        (
          await h.api.inject({
            url: "/api/v1/me/regions",
            headers: h.headers(client),
          })
        ).json().unlocked_regions,
        ["BAMBOO"],
      );
      await db.pool.query(
        "DROP TRIGGER qa_director_rollback ON outbox_events; DROP FUNCTION qa_director_rollback()",
      );
      now += 2000;
      assert.equal(await runOnce(queue), "VERIFIED");
      const row = (
        await db.pool.query(
          "SELECT score,state_hash,ranked FROM run_outcomes WHERE run_id=$1",
          [ticket.run_id],
        )
      ).rows[0];
      assert.equal(row.state_hash, await stateHash(state));
      assert.equal(row.score, state.score);
      assert.equal(row.ranked, false);
      const after = await h.api.inject({
        url: "/api/v1/me/regions",
        headers: h.headers(client),
      });
      assert.deepEqual(
        new Set(after.json().unlocked_regions),
        new Set(["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"]),
      );
      assert.equal(await runOnce(queue), "IDLE");
      const regional = await h.start(client, randomUUID(), {
        mode: "REGIONAL",
        region_id: "TEMPLE",
      });
      assert.equal(regional.starting_region_id, "TEMPLE");
      // A rejected newer replay cannot grant regions to another visitor.
      const other = await h.guest(),
        bad = await h.start(other);
      const segment = part(bad, 1);
      segment.controls = [{ tick: 1, sequence: 0, action: "QUIT" }];
      const upload = await h.upload(other, segment);
      assert.equal(upload.statusCode, 201, upload.body);
      const invalid = await h.api.inject({
        method: "POST",
        url: `/api/v1/runs/${bad.run_id}/finish`,
        headers: h.headers(other),
        payload: {
          final_segment_index: 0,
          final_tick: 1,
          final_hash: await segmentHash(segment),
          end_reason: "ABYSS",
        },
      });
      assert.ok([200, 202].includes(invalid.statusCode), invalid.body);
      assert.equal(await runOnce(queue), "REJECTED");
      assert.deepEqual(
        (
          await h.api.inject({
            url: "/api/v1/me/regions",
            headers: h.headers(other),
          })
        ).json().unlocked_regions,
        ["BAMBOO"],
      );
    } finally {
      await h.api.close();
      await db.close();
    }
  },
);

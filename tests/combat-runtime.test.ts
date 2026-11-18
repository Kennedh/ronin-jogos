import { test } from "node:test";
import assert from "node:assert/strict";
import { testPostgres } from "./helpers/postgres.ts";
import { harness } from "./helpers/runtime.ts";
import { migrate, VerificationQueue } from "@ronin/data";
import { runOnce } from "@ronin/verifier";
import { COMBAT_MANIFEST, courseFor } from "@ronin/content/runner-manifest";
import { createState, step, control } from "@ronin/runner-core";
import type { Action } from "@ronin/runner-core";
import { encodeSegment, segmentHash } from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
import { stateHash } from "@ronin/contracts/canonical";
test(
  "2: earned concentration/special verifies through API, immutable manifest and durable worker",
  { timeout: 60000 },
  async () => {
    const db = await testPostgres();
    await migrate(db.pool);
    let now = Date.parse("2026-11-17T12:00:00Z");
    const h = harness(db.pool, () => new Date(now), undefined, COMBAT_MANIFEST);
    try {
      const client = await h.guest();
      const ticket = await h.start(client);
      assert.equal(ticket.versions.rules_major, 2);
      const world = courseFor(COMBAT_MANIFEST, ticket.seed, 0, 20000000),
        r = COMBAT_MANIFEST.physics;
      let state = createState(ticket.seed, r);
      const actions: ReplaySegment["actions"] = [];
      while (
        state.tick < 3000 &&
        state.status === "RUNNING" &&
        (state.combat!.specials === 0 || state.attackAge < 12)
      ) {
        const input: Action[] = [];
        if (
          state.grounded &&
          (world.entities.some(
            (e) =>
              e.kind === "OBSTACLE" &&
              e.x - state.distance > 0 &&
              e.x - state.distance <= 100000,
          ) ||
            world.gaps.some(
              (g) =>
                g.start - state.distance > 0 &&
                g.start - state.distance <= 65000,
            ))
        )
          input.push("JUMP");
        if (
          world.entities.some(
            (e) =>
              e.idealTick !== undefined &&
              e.idealTick - r.attackWindup === state.tick,
          )
        )
          input.push("ATTACK");
        actions.push(...input.map((action) => ({ tick: state.tick, action })));
        state = step(state, input, world, r).state;
      }
      assert.equal(state.status, "RUNNING");
      assert.ok(state.combat!.specials >= 1, JSON.stringify(state.combat));
      assert.ok(state.perfects >= 9);
      state = control(state, "QUIT");
      now += Math.ceil((state.tick / 60) * 1000) + 1000;
      const segment: ReplaySegment = {
        protocol: "rr-input-v1",
        run_id: ticket.run_id,
        index: 0,
        start_tick: 0,
        end_tick: state.tick,
        previous_hash: null,
        actions,
        controls: [{ tick: state.tick, sequence: 0, action: "QUIT" }],
      };
      const hash = await segmentHash(segment);
      const upload = await h.api.inject({
        method: "PUT",
        url: `/api/v1/runs/${ticket.run_id}/segments/0`,
        headers: {
          ...h.headers(client),
          "content-type": "application/octet-stream",
          "x-start-tick": "0",
          "x-end-tick": String(state.tick),
          "x-segment-hash": hash,
        },
        payload: Buffer.from(encodeSegment(segment)),
      });
      assert.equal(upload.statusCode, 201, upload.body);
      const finish = await h.api.inject({
        method: "POST",
        url: `/api/v1/runs/${ticket.run_id}/finish`,
        headers: h.headers(client),
        payload: {
          final_segment_index: 0,
          final_tick: state.tick,
          final_hash: hash,
          end_reason: "QUIT",
        },
      });
      assert.ok([200, 202].includes(finish.statusCode), finish.body);
      const queue = new VerificationQueue(db.pool, () => new Date(now));
      assert.equal(await runOnce(queue), "VERIFIED");
      const row = (
        await db.pool.query(
          "SELECT state_hash,score,ranked FROM run_outcomes WHERE run_id=$1",
          [ticket.run_id],
        )
      ).rows[0];
      assert.equal(row.state_hash, await stateHash(state));
      assert.equal(row.score, state.score);
      assert.equal(row.ranked, false);
      assert.equal(await runOnce(queue), "IDLE");
    } finally {
      await h.api.close();
      await db.close();
    }
  },
);

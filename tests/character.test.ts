import assert from "node:assert/strict";
import { test } from "node:test";
import { migrate } from "@ronin/data";
import {
  characterParts,
  defaultAppearance,
  resolveAppearance,
  characterSlots,
} from "@ronin/content/character";
import { RULES_V4, createState, createWorld, step } from "@ronin/runner-core";
import { ANIMATIONS, demoPose, drawRig, poseFor } from "@ronin/runner-client";
import type { Brush } from "@ronin/runner-client";
import { testPostgres } from "./helpers/postgres.ts";
import { harness } from "./helpers/runtime.ts";

test(
  "6A: every free layer equips for a guest; ownership, atomic patch, stale saves and CSRF",
  { timeout: 120000 },
  async () => {
    const db = await testPostgres();
    try {
      await migrate(db.pool);
      const h = harness(db.pool, () => new Date());
      try {
        const first = await h.guest(),
          other = await h.guest();
        const get = (url: string, headers = h.headers(first)) =>
          h.api.inject({ url: "/api/v1" + url, headers });
        const patch = (
          slots: Record<string, string>,
          v: number,
          headers = h.headers(first),
        ) =>
          h.api.inject({
            method: "PATCH",
            url: "/api/v1/me/character",
            headers,
            payload: { slots, expected_appearance_version: v },
          });
        assert.equal((await get("/me/character", h.base)).statusCode, 401);
        const catalog = await get("/character/catalog", h.base);
        assert.equal(catalog.statusCode, 200, catalog.body);
        assert.deepEqual(catalog.json().parts, characterParts);
        const inv = (await get("/me/cosmetics")).json();
        assert.deepEqual(inv.equipped.slots, defaultAppearance);
        assert.equal(inv.equipped.appearance_version, 1);
        let v = 1;
        for (const part of characterParts) {
          assert.equal(
            inv.unlocked_part_ids.includes(part.part_id),
            part.is_basic_free,
          );
          const res = await patch({ [part.slot]: part.part_id }, v);
          if (part.is_basic_free) {
            assert.equal(res.statusCode, 200, res.body);
            v = res.json().appearance_version;
            assert.equal(res.json().slots[part.slot], part.part_id);
          } else assert.equal(res.statusCode, 403, res.body);
        }
        assert.equal((await patch({ bogus: "plain" }, v)).statusCode, 422);
        assert.equal(
          (await patch({ eye_style: "robe_blue" }, v)).statusCode,
          422,
        );
        assert.equal(
          (
            await patch({ outfit_id: "robe_blue" }, v, {
              ...h.headers(first),
              "x-csrf-token": "",
            })
          ).statusCode,
          403,
        );
        const before = (await get("/me/character")).json();
        assert.equal(
          (
            await patch(
              { outfit_id: "robe_blue", slash_effect_id: "trail_aurora" },
              v,
            )
          ).statusCode,
          403,
        );
        assert.deepEqual((await get("/me/character")).json(), before);
        const race = await Promise.all([
          patch({ outfit_id: "robe_blue" }, v),
          patch({ outfit_id: "robe_moss" }, v),
        ]);
        assert.deepEqual(race.map((r) => r.statusCode).sort(), [200, 409]);
        const won = race.find((r) => r.statusCode === 200)!.json();
        assert.deepEqual(
          (await patch({ outfit_id: won.slots.outfit_id }, v)).json(),
          won,
        );
        assert.deepEqual(
          (await get("/me/character", h.headers(other))).json().slots,
          defaultAppearance,
        );
        const denied = await h.api.inject({
          method: "PATCH",
          url: "/api/v1/me/emblems/equip",
          headers: h.headers(first),
          payload: { emblem_instance_id: "seal_castle" },
        });
        assert.equal(denied.statusCode, 403);
      } finally {
        await h.api.close();
      }
    } finally {
      await db.close();
    }
  },
);

test("6A: pairwise modular layers draw every pose and preserve the competitive replay", () => {
  const ids = new Set(characterParts.map((p) => p.part_id));
  assert.equal(ids.size, characterParts.length);
  assert.deepEqual(
    resolveAppearance({
      body_palette: "removed_part",
      outfit_id: "sword_jade",
    }),
    defaultAppearance,
  );
  let marks = 0;
  const check = (n: number) => {
    assert.ok(Number.isFinite(n));
    marks++;
  };
  const brush: Brush = {
    line(points, color, width) {
      check(color);
      check(width);
      for (const [x, y] of points) {
        check(x);
        check(y);
      }
    },
    polygon(points, color) {
      check(color);
      for (const [x, y] of points) {
        check(x);
        check(y);
      }
    },
    circle(x, y, r, color) {
      check(x);
      check(y);
      check(r);
      check(color);
    },
  };
  for (const [i, first] of characterParts.entries())
    for (const second of characterParts.slice(i + 1)) {
      if (first.slot === second.slot) continue;
      const appearance = {
        ...defaultAppearance,
        [first.slot]: first.part_id,
        [second.slot]: second.part_id,
      };
      for (const pose of ANIMATIONS) {
        const before = marks;
        drawRig(brush, demoPose(pose, 12), RULES_V4, false, false, appearance);
        assert.ok(marks > before);
      }
    }
  const seed = "0123456789abcdeffedcba9876543210",
    world = createWorld();
  let reference = createState(seed, RULES_V4),
    rendered = createState(seed, RULES_V4);
  for (let tick = 0; tick < 160; tick++) {
    const inputs =
      tick === 8 ? ["JUMP" as const] : tick === 22 ? ["ATTACK" as const] : [];
    reference = step(reference, inputs, world, RULES_V4).state;
    const look = { ...defaultAppearance };
    for (const slot of characterSlots) {
      const candidates = characterParts.filter((p) => p.slot === slot);
      look[slot] = candidates[tick % candidates.length]!.part_id;
    }
    drawRig(brush, poseFor(rendered, RULES_V4), RULES_V4, false, false, look);
    rendered = step(rendered, inputs, world, RULES_V4).state;
    assert.deepEqual(rendered, reference);
  }
});

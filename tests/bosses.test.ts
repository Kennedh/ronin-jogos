import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RULES_V4,
  RULES_V3,
  RULES_V2,
  RULES_V1,
  createState,
  createWorld,
  step,
  control,
  bossSchedule,
  bossView,
  REGIONS,
  journeyAt,
  BOSS_PROFILES,
} from "@ronin/runner-core";
import {
  BOSS_MANIFEST,
  loadManifest,
  courseFor,
} from "@ronin/content/runner-manifest";
import { entryAt } from "@ronin/content/solver";
import { bossCorridor, bossRun } from "./fixtures/boss-run.ts";
function initial(region: number, cycle: number, seed: string) {
  const offset =
    [0, 60000000, 140000000, 240000000][region]! + (cycle - 1) * 320000000;
  const schedule = bossSchedule(offset, 0, RULES_V4),
    s = entryAt(schedule.warning, RULES_V4);
  s.bosses!.seed = seed;
  return s;
}
test("4: boss major dispatch is explicit; legacy states have no boss component", async () => {
  assert.equal((await loadManifest(BOSS_MANIFEST)).rules_major, 4);
  for (const r of [RULES_V1, RULES_V2, RULES_V3])
    assert.equal(createState("1".repeat(32), r).bosses, undefined);
  await assert.rejects(() =>
    loadManifest({ ...BOSS_MANIFEST, physics: RULES_V3 }),
  );
  await assert.rejects(() =>
    loadManifest({
      ...BOSS_MANIFEST,
      physics: { ...RULES_V4, bambooMeters: 100 },
    }),
  );
});
test("RR-BOSS-001: all four guardians/cycles survive dodge-only with input margin and no penalty", () => {
  for (let region = 0; region < 4; region++)
    for (const cycle of [1, 2, 3, 4, 5, 6, 50])
      for (const seed of ["0".repeat(32), "f".repeat(32)])
        for (const margin of [-3, 0, 3]) {
          const s = initial(region, cycle, seed),
            run = bossCorridor(s, RULES_V4, false, margin);
          assert.equal(
            run.state.hp,
            3,
            JSON.stringify({
              region,
              cycle,
              seed,
              margin,
              phase: bossView(run.state, RULES_V4),
              outcomes: run.outcomes,
            }),
          );
          assert.equal(run.state.status, "RUNNING");
          assert.equal(run.outcomes.length, 1);
          assert.equal(bossView(run.state, RULES_V4)!.remaining, 0);
          assert.equal(run.outcomes[0]!.result, "RETREATED");
          assert.equal(run.state.bosses!.bonus, "0");
          assert.equal(run.state.bosses!.seals, 0);
          assert.equal(run.state.combat!.concentration, 0);
        }
});
test("RR-BOSS-002/003: victories, unique windows, bounded corruption and fixed bonuses", () => {
  for (let region = 0; region < 4; region++)
    for (const cycle of [1, 2, 3, 4, 5, 6, 50]) {
      const run = bossCorridor(
          initial(region, cycle, "1".repeat(32)),
          RULES_V4,
          true,
        ),
        profile = BOSS_PROFILES[region]!;
      assert.equal(
        run.state.hp,
        3,
        JSON.stringify({ region, cycle, outcomes: run.outcomes }),
      );
      assert.equal(
        run.outcomes[0]?.result,
        "DEFEATED",
        JSON.stringify({ region, cycle, outcomes: run.outcomes }),
      );
      assert.equal(run.outcomes.length, 1);
      assert.equal(run.outcomes[0]!.hits, profile.hits);
      assert.equal(run.state.bosses!.bonus, String(profile.bonus));
      assert.equal(run.state.kills, 0);
      assert.equal(run.state.bosses!.seals, 1 << region);
      assert.equal(
        run.events.filter((e) => e.type === "BOSS_HIT").length,
        profile.hits,
      );
    }
});
test("4: last legal hit wins over retreat, out-of-window swings do not damage bosses", () => {
  let s = initial(0, 1, "0".repeat(32));
  const v = bossSchedule(s.distance, 0, RULES_V4);
  s = {
    ...s,
    distance: v.end - 6000,
    journey: journeyAt(v.end - 6000, 0, RULES_V4),
    attackAge: 4,
    bosses: {
      ...s.bosses!,
      current: {
        instance: v.instance,
        boss: "B01",
        region: "BAMBOO",
        cycle: 1,
        hits: 2,
        usedWindow: 3,
        result: null,
        resultTick: 0,
      },
    },
  };
  const u = step(s, [], createWorld(), RULES_V4);
  assert.equal(u.state.bosses!.current!.result, "DEFEATED");
  assert.equal(
    u.events.some((e) => e.type === "BOSS_RETREATED"),
    false,
  );
  const again = step(u.state, [], createWorld(), RULES_V4);
  assert.equal(again.state.bosses!.bonus, "300");
  assert.equal(
    again.events.some((e) => e.boss),
    false,
  );
  s = initial(0, 1, "0".repeat(32));
  s.attackAge = 4;
  const no = step(s, [], createWorld(), RULES_V4);
  assert.equal(no.state.bosses!.current!.hits, 0);
});
test("4: pause freezes encounter; attacks, retreat and purification never heal; abyss still wins", () => {
  let s = initial(1, 1, "0".repeat(32));
  s.hp = 1;
  const run = bossCorridor(s, RULES_V4, true);
  assert.equal(run.state.hp, 1);
  const paused = control(run.state, "PAUSE");
  assert.deepEqual(step(paused, [], createWorld(), RULES_V4).state, paused);
  s = initial(0, 1, "0".repeat(32));
  s.y = 119999;
  s.vy = 100000;
  s.grounded = false;
  s.invulnerableUntil = s.tick + 1000;
  const death = step(
    s,
    ["ATTACK"],
    createWorld([{ start: s.distance, end: s.distance + 1000000 }]),
    RULES_V4,
  );
  assert.equal(death.state.endReason, "ABYSS");
  assert.equal(
    death.events.some((e) => e.boss),
    false,
  );
});
test("4: director reserves complete warning/arena/exit corridors with stable window geometry", () => {
  for (const region of REGIONS)
    for (const cycle of [1, 4]) {
      const i = REGIONS.indexOf(region),
        s = initial(i, cycle, "2".repeat(32)),
        a = bossSchedule(s.distance, 0, RULES_V4);
      for (let start = a.warning; start < a.exit; start += 2000000) {
        const w = courseFor(
          BOSS_MANIFEST,
          s.bosses!.seed,
          start,
          start + 2000000,
        );
        assert.equal(
          w.gaps.some((g) => g.start < a.exit && g.end > a.warning),
          false,
        );
        assert.equal(
          w.entities.some((e) => e.x >= a.warning && e.x < a.exit),
          false,
        );
      }
    }
});
test(
  "4: two full cycles continue through all guardians, retaining bounded state",
  { timeout: 120000 },
  () => {
    const run = bossRun(
      "0123456789abcdeffedcba9876543210",
      RULES_V4,
      640000000,
    );
    assert.equal(run.outcomes.length, 8);
    assert.equal(new Set(run.outcomes.map((b) => b.instance)).size, 8);
    assert.deepEqual(run.state.bosses!.defeats, [2, 2, 2, 2]);
    assert.equal(run.state.bosses!.bonus, "4500");
    assert.equal(run.state.bosses!.seals, 15);
    assert.equal(run.state.journey!.cycle, 3);
  },
);

test(
  "4: five continuous cycles alternate victories and retreats without loss of continuity",
  { timeout: 120000 },
  () => {
    const run = bossRun(
      "abcdef01234567899876543210fedcba",
      RULES_V4,
      1600000000,
      "BAMBOO",
      (cycle, region) => (cycle + REGIONS.indexOf(region)) % 2 === 0,
    );
    assert.equal(run.outcomes.length, 20);
    assert.equal(new Set(run.outcomes.map((v) => v.instance)).size, 20);
    assert.equal(
      run.outcomes.filter((v) => v.result === "DEFEATED").length,
      10,
    );
    assert.equal(
      run.outcomes.filter((v) => v.result === "RETREATED").length,
      10,
    );
    assert.equal(run.state.hp, 3);
    assert.equal(run.state.journey!.cycle, 6);
  },
);
test("4: three unavoided guardian attacks exhaust three lives and cannot award a retreat", () => {
  let s = initial(0, 1, "0".repeat(32));
  const end = bossSchedule(s.distance, 0, RULES_V4).end;
  while (s.status === "RUNNING" && s.distance < end)
    s = step(s, [], createWorld(), RULES_V4).state;
  assert.equal(s.hp, 0);
  assert.equal(s.endReason, "HP_ZERO");
  assert.equal(s.bosses!.bonus, "0");
  assert.deepEqual(s.bosses!.retreats, [0, 0, 0, 0]);
});

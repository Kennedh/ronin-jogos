import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  createWorld,
  step,
  control,
  divideStep,
  createRandom,
  randomNext,
  RULES_V1,
} from "@ronin/runner-core";
import type { Action } from "@ronin/runner-core";
const seed = "0123456789abcdeffedcba9876543210";
const flat = createWorld();
function run(
  n: number,
  state = createState(seed),
  world = flat,
  inputs: Record<number, Action[]> = {},
) {
  const events = [];
  for (let i = 0; i < n && state.status === "RUNNING"; i++) {
    const result = step(state, inputs[state.tick] ?? [], world);
    state = result.state;
    events.push(...result.events);
  }
  return { state, events };
}
test("RR-CORE-004: independent integer fixtures for displacement and first jump", () => {
  assert.equal(run(120).state.distance, 720000);
  assert.equal(run(120).state.score, "180");
  const a = run(1, createState(seed), flat, { 0: ["JUMP"] }).state;
  assert.equal(a.y, -11916);
  assert.equal(a.vy, -715000);
  assert.equal(a.yRemainder, -40);
  const b = step(a, [], flat).state;
  assert.equal(b.y, -23250);
  assert.equal(b.vy, -680000);
  assert.equal(b.yRemainder, 0);
  const top = run(21, createState(seed), flat, { 0: ["JUMP"] }).state;
  assert.equal(top.y, -127750);
  assert.equal(top.vy, -15000);
  const landed = run(42, createState(seed), flat, { 0: ["JUMP"] });
  assert.equal(landed.state.y, 0);
  assert.equal(landed.state.grounded, true);
  assert.equal(landed.events.filter((e) => e.type === "LAND").length, 1);
  assert.deepEqual(divideStep(-1, 0), [0, -1]);
  assert.deepEqual(divideStep(-1, -59), [-1, 0]);
});
test("RR-CORE-001: exactly two impulses before landing; third cannot reset velocity", () => {
  const result = run(3, createState(seed), flat, {
    0: ["JUMP"],
    1: ["JUMP"],
    2: ["JUMP"],
  });
  assert.deepEqual(
    result.events.map((e) => e.type),
    ["JUMP", "DOUBLE_JUMP"],
  );
  assert.equal(result.state.jumps, 2);
  assert.equal(result.state.vy, -600000);
  const landed = run(100, result.state);
  assert.equal(landed.state.grounded, true);
  assert.equal(landed.state.jumps, 0);
  assert.ok(
    step(landed.state, ["JUMP"], flat).events.some((e) => e.type === "JUMP"),
  );
});
test("coyote boundary uses first impulse only within five declared ticks", () => {
  const gap = createWorld([{ start: 1, end: 1000000 }]);
  const a = run(4, createState(seed), gap).state;
  assert.ok(step(a, ["JUMP"], gap).events.some((e) => e.type === "JUMP"));
  const b = run(5, createState(seed), gap).state;
  assert.ok(
    step(b, ["JUMP"], gap).events.some((e) => e.type === "DOUBLE_JUMP"),
  );
});
test("buffered landing consumes a recent command, expired command does not bounce", () => {
  const air = {
    ...createState(seed),
    y: -500,
    vy: 100000,
    grounded: false,
    jumps: 2,
  };
  const landed = step(air, ["JUMP"], flat);
  assert.ok(landed.events.some((e) => e.type === "LAND"));
  assert.ok(landed.events.some((e) => e.type === "JUMP"));
  assert.equal(landed.state.grounded, false);
  const expired = { ...air, tick: 10, jumpBufferUntil: 10 };
  assert.equal(step(expired, [], flat).state.grounded, true);
});
test("slide lasts33 ticks, suppresses attack/jump, then recovery lasts6 ticks", () => {
  let s = step(createState(seed), ["SLIDE"], flat).state;
  assert.equal(s.slideUntil, 33);
  const blocked = step(s, ["ATTACK", "JUMP"], flat);
  assert.equal(blocked.state.attackAge, -1);
  assert.equal(blocked.state.y, 0);
  s = run(31, blocked.state).state;
  assert.equal(s.tick, 33);
  assert.equal(s.grounded, true);
  assert.equal(
    step(s, ["SLIDE"], flat).events.some((e) => e.type === "SLIDE"),
    false,
  );
  s = run(6, s).state;
  assert.equal(
    step(s, ["SLIDE"], flat).events.some((e) => e.type === "SLIDE"),
    true,
  );
  const simultaneous = step(createState(seed), ["SLIDE", "JUMP"], flat);
  assert.deepEqual(
    simultaneous.events.map((e) => e.type),
    ["JUMP"],
  );
});
test("posture remains low under a ceiling, but a later unrelated ceiling does not auto-slide", () => {
  const ceiling = createWorld(
    [],
    [
      {
        id: "ceiling",
        x: 100000,
        width: 300000,
        top: -100000,
        bottom: -50000,
        kind: "OBSTACLE",
      },
    ],
  );
  let s = run(34, createState(seed), ceiling, { 0: ["SLIDE"] }).state;
  assert.equal(s.hp, 3);
  assert.equal(s.slideUntil, 34);
  s = run(50, s, ceiling).state;
  assert.ok(s.tick >= s.slideUntil);
  const later = createWorld(
    [],
    [
      {
        id: "new",
        x: s.distance,
        width: 100000,
        top: -100000,
        bottom: -50000,
        kind: "OBSTACLE",
      },
    ],
  );
  assert.equal(step(s, [], later).state.hp, 2);
});
test("attack windup4/active7/recovery11; one entity cannot award twice", () => {
  const enemy = createWorld(
    [],
    [
      {
        id: "e",
        x: 120000,
        width: 30000,
        top: -88000,
        bottom: 0,
        kind: "ENEMY",
        idealTick: 4,
      },
    ],
  );
  let s = createState(seed);
  for (let tick = 0; tick < 4; tick++) {
    s = step(s, tick === 0 ? ["ATTACK"] : [], enemy).state;
    assert.equal(s.kills, 0);
  }
  const hit = step(s, [], enemy);
  assert.equal(hit.state.kills, 1);
  assert.equal(hit.state.perfects, 1);
  assert.equal(hit.state.hp, 3);
  s = run(17, hit.state, enemy, { 5: ["ATTACK"], 21: ["ATTACK"] }).state;
  assert.equal(s.tick, 22);
  assert.equal(s.kills, 1);
  assert.equal(s.perfects, 1);
  assert.ok(step(s, ["ATTACK"], enemy).events.some((e) => e.type === "ATTACK"));
});
test("perfect window includes ±6 and excludes7; attack wins simultaneous common contact", () => {
  for (const idealTick of [4, 16, 17]) {
    const e = createWorld(
      [],
      [
        {
          id: "e",
          x: 60000,
          width: 30000,
          top: -88000,
          bottom: 0,
          kind: "ENEMY",
          idealTick,
        },
      ],
    );
    const s = { ...createState(seed), tick: 10, attackAge: 4, distance: 40000 };
    const hit = step(s, [], e).state;
    assert.equal(hit.hp, 3);
    assert.equal(hit.kills, 1);
    assert.equal(hit.perfects, idealTick === 17 ? 0 : 1);
  }
});
test("RR-CORE-002: damage3→2→1→0 and invulnerability is exactly54ticks", () => {
  const hazard = createWorld(
    [],
    [
      {
        id: "wall",
        x: 0,
        width: 10000000,
        top: -88000,
        bottom: 0,
        kind: "OBSTACLE",
      },
    ],
  );
  const first = run(54, createState(seed), hazard);
  assert.equal(first.state.hp, 2);
  const second = step(first.state, [], hazard).state;
  assert.equal(second.hp, 1);
  const death = run(54, second, hazard);
  assert.equal(death.state.hp, 0);
  assert.equal(death.state.endReason, "HP_ZERO");
  assert.equal(death.state.tick, 109);
  assert.strictEqual(step(death.state, [], hazard).state, death.state);
  assert.throws(() => step(death.state, ["JUMP"], hazard));
});
test("RR-CORE-003: abyss fatal with3/2/1HP and i-frames; no hit on fatal tick", () => {
  const world = createWorld(
    [{ start: 0, end: 10000000 }],
    [
      {
        id: "e",
        x: 70000,
        width: 30000,
        top: 40000,
        bottom: 130000,
        kind: "ENEMY",
        idealTick: 0,
      },
    ],
  );
  for (const hp of [3, 2, 1]) {
    const near = {
      ...createState(seed),
      hp,
      y: 119999,
      vy: 0,
      grounded: false,
      attackAge: 4,
      invulnerableUntil: 999,
    };
    const result = step(near, [], world);
    assert.equal(result.state.status, "DEAD");
    assert.equal(result.state.endReason, "ABYSS");
    assert.equal(result.state.hp, 0);
    assert.equal(result.state.kills, 0);
    assert.deepEqual(
      result.events.map((e) => e.type),
      ["DEATH"],
    );
  }
});
test("jump crosses a real gap while walking off falls; pause freezes every competitive field", () => {
  const world = createWorld([{ start: 60000, end: 200000 }]);
  assert.equal(run(100, createState(seed), world).state.endReason, "ABYSS");
  const crossed = run(100, createState(seed), world, { 5: ["JUMP"] });
  assert.equal(crossed.state.hp, 3);
  assert.equal(crossed.state.status, "RUNNING");
  const paused = control(crossed.state, "PAUSE");
  assert.strictEqual(step(paused, [], world).state, paused);
  assert.throws(() => step(paused, ["ATTACK"], world));
  const resumed = control(paused, "RESUME");
  assert.deepEqual(resumed, crossed.state);
  assert.equal(control(resumed, "QUIT").endReason, "QUIT");
});
test("PRNG known vector and independent streams; simulation is immutable and has no skin fields", () => {
  const state = [1, 2, 3, 4] as const;
  const values: number[] = [];
  // Independently evaluated xoshiro128** reference vector.
  let next: readonly [number, number, number, number] = state;
  for (let i = 0; i < 3; i++) {
    const r = randomNext(next);
    values.push(r.value);
    next = r.state;
  }
  assert.deepEqual(values, [11520, 0, 5927040]);
  assert.notDeepEqual(
    createRandom(seed, "world"),
    createRandom(seed, "cosmetic"),
  );
  const rng = createRandom(seed, "world");
  let cosmetic = createRandom(seed, "cosmetic");
  for (let i = 0; i < 100; i++) cosmetic = randomNext(cosmetic).state;
  assert.deepEqual(createRandom(seed, "world"), rng);
  const previous = createState(seed);
  const copy = structuredClone(previous);
  step(previous, ["JUMP"], flat);
  assert.deepEqual(previous, copy);
  assert.equal(RULES_V1.speedCeiling, 600000);
  assert.throws(() =>
    createWorld([
      { start: 0, end: 2 },
      { start: 1, end: 3 },
    ]),
  );
});

test("rational division and score remain exact near safe-integer ceiling", () => {
  const n = 9007199254740959;
  assert.deepEqual(divideStep(n, 0), [150119987579015, 59]);
  const state = { ...createState(seed), distance: 9007199254513999 };
  const next = step(state, [], flat).state;
  assert.equal(next.score, ((BigInt(next.distance) / 40000n) * 10n).toString());
});

test("long primitive course prunes resolved entities without healing or re-awarding", () => {
  const world = createWorld(
    [],
    Array.from({ length: 300 }, (_, i) => ({
      id: `e-${i}`,
      x: 180000 + i * 240000,
      width: 20000,
      top: -88000,
      bottom: 0,
      kind: "ENEMY" as const,
    })),
  );
  let state = createState(seed),
    peak = 0;
  for (let tick = 0; tick < 12000; tick++) {
    state = step(state, tick % 40 === 2 ? ["ATTACK"] : [], world).state;
    peak = Math.max(peak, state.resolved.length);
  }
  assert.equal(state.tick, 12000);
  assert.equal(state.hp, 3);
  assert.equal(state.kills, 300);
  assert.equal(state.score, "27000");
  assert.ok(peak <= 2);
});

test("numeric manifests are immutable and cannot silently replace rules in an active replay", async () => {
  const { compileRules } = await import("@ronin/runner-core");
  const alternate = compileRules({
    ...RULES_V1,
    version: "rr-physics-candidate-2",
    speed: 400000,
  });
  assert.ok(Object.isFrozen(alternate));
  assert.throws(
    () => step(createState(seed), [], flat, alternate),
    /rules_version_mismatch/,
  );
  const silent = compileRules({ ...RULES_V1, speed: 400000 });
  assert.throws(
    () => step(createState(seed), [], flat, silent),
    /rules_version_mismatch/,
  );
  const next = step(createState(seed, alternate), [], flat, alternate).state;
  assert.equal(next.distance, 6666);
  assert.equal(next.xRemainder, 40);
  assert.equal(step(createState(seed), [], flat).state.distance, 6000);
  assert.throws(() => compileRules({ ...RULES_V1, speed: 700000 }));
  assert.throws(() => compileRules({ ...RULES_V1, tickRate: 30 }));
});

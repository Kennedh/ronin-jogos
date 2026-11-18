import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  createWorld,
  step,
  control,
  RULES_V1,
  RULES_V2,
  compileRules,
} from "@ronin/runner-core";
import type { SimState, Entity, SimEvent, Rules } from "@ronin/runner-core";
import {
  COMBAT_MANIFEST,
  FOUNDATION_MANIFEST,
  loadManifest,
  courseFor,
  manifestHash,
} from "@ronin/content/runner-manifest";
import {
  DEFAULT_BINDINGS,
  parseBindings,
  rebind,
  actionFor,
  poseFor,
  demoPose,
  drawRig,
  ANIMATIONS,
} from "@ronin/runner-client";
const seed = "0123456789abcdeffedcba9876543210";
function enemy(id: string, x: number, idealTick?: number): Entity {
  return {
    id,
    x,
    width: 30000,
    top: -88000,
    bottom: 0,
    kind: "ENEMY",
    ...(idealTick === undefined ? {} : { idealTick }),
  };
}
function swing(s: SimState, entities: Entity[] = [], rules: Rules = RULES_V2) {
  const events: SimEvent[] = [];
  for (let i = 0; i < 24; i++) {
    const u = step(
      s,
      i === 0 ? ["ATTACK"] : [],
      createWorld([], entities),
      rules,
    );
    s = u.state;
    events.push(...u.events);
  }
  return { state: s, events };
}
function charged() {
  let s = createState(seed, RULES_V2);
  for (let i = 0; i < 9; i++)
    s = swing(s, [enemy("earn-" + i, s.distance + 120000, s.tick + 4)]).state;
  return s;
}
test("2: legacy state shape and rules stay separate; v2 metadata is complete and immutable", async () => {
  const old = createState(seed, RULES_V1);
  assert.equal(Object.hasOwn(old, "combat"), false);
  const oldManifest = await loadManifest(FOUNDATION_MANIFEST);
  const modern = await loadManifest(COMBAT_MANIFEST);
  assert.equal(oldManifest.rules_major, 1);
  assert.equal(modern.rules_major, 2);
  assert.notEqual(await manifestHash(oldManifest), await manifestHash(modern));
  assert.throws(() => compileRules({ ...RULES_V2, normalGain: 0 }));
  assert.throws(() => compileRules({ ...RULES_V2, concentrationCap: 99 }));
  await assert.rejects(() =>
    loadManifest({ ...COMBAT_MANIFEST, physics: RULES_V1 }),
  );
  assert.throws(() =>
    step(createState(seed, RULES_V2), [], createWorld(), RULES_V1),
  );
});
test("2: perfect earns 12, normal earns 3; one streak increment per attack even with multiple enemies", () => {
  let s = createState(seed, RULES_V2);
  s = swing(s, [enemy("a", 120000, 4), enemy("b", 140000, 4)]).state;
  assert.equal(s.kills, 2);
  assert.equal(s.perfects, 2);
  assert.equal(s.combat!.combo, 1);
  assert.equal(s.combat!.concentration, 24);
  s = swing(s, [enemy("c", s.distance + 120000)]).state;
  assert.equal(s.combat!.concentration, 27);
  assert.equal(s.combat!.combo, 0);
  assert.equal(s.combat!.bestCombo, 1);
  const keep = compileRules({ ...RULES_V2, normalBreaksCombo: 0 });
  let alternate = createState(seed, keep);
  alternate = swing(alternate, [enemy("a", 120000, 4)], keep).state;
  alternate = swing(
    alternate,
    [enemy("b", alternate.distance + 120000)],
    keep,
  ).state;
  assert.equal(alternate.combat!.combo, 1);
});
test("2: an empty attack resets streak only after its active window and never consumes charge", () => {
  const s = charged();
  assert.equal(s.combat!.concentration, 100);
  assert.equal(s.combat!.specials, 0);
  assert.equal(s.combat!.combo, 9);
  const result = swing(s);
  assert.equal(result.state.combat!.concentration, 100);
  assert.equal(result.state.combat!.combo, 0);
  assert.equal(result.state.combat!.bestCombo, 9);
  assert.equal(result.events.filter((e) => e.type === "MISS").length, 1);
  assert.equal(result.state.hp, 3);
  assert.equal(s.combat!.combo, 9); // Input state is immutable.
});
test("2: special consumes on next success, bounded front/vertical range, eligibility and single awards", () => {
  const s = charged(),
    at = s.distance;
  const entities = [
    enemy("primary", at + 120000, s.tick + 4),
    enemy("secondary", at + 240000, s.tick + 4),
    { ...enemy("protected", at + 250000), specialEligible: false },
    enemy("far", at + 400000),
    { ...enemy("air", at + 240000), top: -300000, bottom: -200000 },
    enemy("behind", at - 300000),
    { ...enemy("wall", at + 245000), kind: "OBSTACLE" as const },
  ];
  const result = swing(s, entities),
    c = result.state.combat!;
  assert.equal(c.specials, 1);
  assert.equal(c.concentration, 0);
  assert.equal(result.state.kills - s.kills, 2);
  assert.equal(result.state.perfects - s.perfects, 1);
  assert.deepEqual(
    result.events.filter((e) => e.type === "SPECIAL_HIT").map((e) => e.entity),
    ["secondary"],
  );
  assert.equal(result.events.filter((e) => e.type === "SPECIAL").length, 1);
  assert.equal(
    result.state.score,
    (
      BigInt(Math.floor(result.state.distance / 40000)) * 10n +
      BigInt(result.state.kills) * 30n +
      BigInt(result.state.perfects) * 100n
    ).toString(),
  );
});
test("2: reaching 100 during a strike cannot trigger until a later attack", () => {
  let s = createState(seed, RULES_V2);
  for (let i = 0; i < 8; i++)
    s = swing(s, [enemy("e" + i, s.distance + 120000, s.tick + 4)]).state;
  assert.equal(s.combat!.concentration, 96);
  const ninth = swing(s, [enemy("ninth", s.distance + 120000, s.tick + 4)]);
  assert.equal(ninth.state.combat!.concentration, 100);
  assert.equal(ninth.state.combat!.specials, 0);
});
test("2: vulnerability interval starts inclusive/ends exclusive; attack still respects vertical overlap", () => {
  for (const [start, end, expected] of [
    [4, 5, 1],
    [0, 4, 0],
    [11, 12, 0],
  ]) {
    const e = {
      ...enemy("guard", 120000, 4),
      vulnerability: { start: start!, end: end! },
    };
    assert.equal(swing(createState(seed, RULES_V2), [e]).state.kills, expected);
  }
  assert.equal(
    swing(createState(seed, RULES_V2), [
      { ...enemy("high", 120000), top: -300000, bottom: -200000 },
    ]).state.kills,
    0,
  );
});
test("2: special is no shield/heal, abyss wins over active charged attack, pause freezes combat", () => {
  const s = charged();
  const paused = control(s, "PAUSE");
  assert.deepEqual(step(paused, [], createWorld(), RULES_V2).state, paused);
  const hit = swing(s, [
    enemy("primary", s.distance + 120000, s.tick + 4),
    { ...enemy("stone", s.distance + 10000), kind: "OBSTACLE" },
  ]);
  assert.equal(hit.state.hp, 2);
  assert.equal(hit.state.combat!.specials, 1);
  const fatal = { ...s, y: 119999, vy: 200000, grounded: false, attackAge: 4 };
  const result = step(
    fatal,
    [],
    createWorld(
      [{ start: s.distance, end: s.distance + 1000000 }],
      [enemy("target", s.distance + 120000, s.tick)],
    ),
    RULES_V2,
  );
  assert.equal(result.state.endReason, "ABYSS");
  assert.equal(result.state.hp, 0);
  assert.equal(result.state.combat!.concentration, 100);
  assert.equal(result.state.kills, s.kills);
  assert.deepEqual(
    result.events.map((e) => e.type),
    ["DEATH"],
  );
});
test("2: windowed telegraphs are deterministic, stable and match global integer travel", () => {
  const a = courseFor(COMBAT_MANIFEST, seed, 0, 4000000),
    b = courseFor(COMBAT_MANIFEST, seed, 1200000, 2400000);
  for (const e of b.entities) {
    const same = a.entities.find((x) => x.id === e.id);
    if (same) assert.deepEqual(e, same);
    if (e.idealTick !== undefined) {
      const distance = (e.idealTick + 1) * 6000;
      assert.ok(Math.abs(e.x - distance - 92000) <= 6000);
    }
  }
  assert.ok(a.entities.some((e) => e.idealTick !== undefined));
  assert.ok(
    courseFor(FOUNDATION_MANIFEST, seed, 0, 1000000).entities.every(
      (e) => e.idealTick === undefined,
    ),
  );
});
test("2: shortcuts are durable, unambiguous and reserve navigation/pause keys", () => {
  const keys = rebind(DEFAULT_BINDINGS, "JUMP", "KeyK");
  assert.equal(actionFor(keys, "KeyK"), "JUMP");
  assert.equal(actionFor(keys, "Space"), undefined);
  assert.deepEqual(parseBindings(JSON.parse(JSON.stringify(keys))), keys);
  for (const bad of ["Escape", "Tab", "ControlLeft", "KeyJ"])
    assert.throws(() => rebind(DEFAULT_BINDINGS, "JUMP", bad));
  assert.throws(() =>
    parseBindings({ JUMP: ["Space"], ATTACK: ["Space"], SLIDE: ["KeyS"] }),
  );
});
test("2: shared layered rig draws every pose, respects reduced motion and does not mutate the core", () => {
  const s = charged(),
    before = JSON.stringify(s);
  let primitives = 0;
  const brush = {
    line(points: readonly (readonly number[])[]) {
      for (const p of points) assert.ok(p.every(Number.isFinite));
      primitives++;
    },
    polygon(points: readonly (readonly number[])[]) {
      for (const p of points) assert.ok(p.every(Number.isFinite));
      primitives++;
    },
    circle(x: number, y: number, r: number) {
      assert.ok([x, y, r].every(Number.isFinite));
      assert.ok(r > 0);
      primitives++;
    },
  };
  for (const animation of ANIMATIONS)
    for (const reduced of [false, true])
      drawRig(brush, demoPose(animation, 10), RULES_V2, reduced, true);
  assert.ok(primitives > 100);
  poseFor(s, RULES_V2);
  assert.equal(JSON.stringify(s), before);
  const midair = { ...s, grounded: false, vy: -200000, jumps: 2, attackAge: 6 };
  const p = poseFor(midair, RULES_V2);
  assert.equal(p.locomotion, "DOUBLE_JUMP");
  assert.equal(p.action, "ATTACK_ACTIVE");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  RULES_V3,
  RULES_V2,
  compileRules,
  createState,
  step,
  control,
  journeyAt,
  regionLengths,
  tickAtDistance,
  REGIONS,
  worldAtTick,
  actorPhase,
  createWorld,
} from "@ronin/runner-core";
import {
  PATTERNS,
  materialize,
  BLOCK_SIZE,
  blockAt,
  directorCourse,
  admissible,
} from "@ronin/content/director";
import { solveWindow } from "@ronin/content/solver";
import {
  DIRECTOR_MANIFEST,
  COMBAT_MANIFEST,
  FOUNDATION_MANIFEST,
  loadManifest,
} from "@ronin/content/runner-manifest";
const seed = "0123456789abcdeffedcba9876543210";
test("3: major registry preserves historical dispatch and rejects incompatible physics", async () => {
  for (const m of [FOUNDATION_MANIFEST, COMBAT_MANIFEST, DIRECTOR_MANIFEST])
    assert.equal((await loadManifest(m)).rules_major, m.rules_major);
  await assert.rejects(() =>
    loadManifest({ ...DIRECTOR_MANIFEST, physics: RULES_V2 }),
  );
  assert.equal(createState(seed, RULES_V2).journey, undefined);
});
test("3: four regions, five cycles, cap and regional real-distance semantics", () => {
  const r = RULES_V3,
    lengths = regionLengths(r),
    total = lengths.reduce((a, b) => a + b, 0);
  for (let cycle = 0; cycle < 5; cycle++) {
    let start = cycle * total;
    for (let i = 0; i < 4; i++) {
      const j = journeyAt(start, 0, r);
      assert.equal(j.region, REGIONS[i]);
      assert.equal(j.cycle, cycle + 1);
      assert.equal(j.speed, Math.min(600000, 360000 + cycle * 80000));
      assert.equal(j.corruption, Math.min(cycle, 3));
      assert.equal(journeyAt(start + lengths[i]! - 1, 0, r).region, REGIONS[i]);
      start += lengths[i]!;
    }
  }
  for (const region of REGIONS) {
    const s = createState(seed, r, region);
    assert.equal(s.distance, 0);
    assert.equal(s.hp, 3);
    assert.equal(s.journey!.region, region);
    assert.equal(s.journey!.cycle, 1);
    assert.deepEqual(s.journey!.visited, [region]);
    assert.equal(s.score, "0");
  }
  const before = createState(seed, r);
  const boundary = {
    ...before,
    distance: lengths[0]! - 1000,
    journey: journeyAt(lengths[0]! - 1000, 0, r),
    hp: 2,
    combat: { ...before.combat!, concentration: 77 },
  };
  const after = step(boundary, [], createWorld(), r);
  assert.equal(after.state.hp, 2);
  assert.equal(after.state.combat!.concentration, 77);
  assert.deepEqual(after.state.journey!.visited, ["BAMBOO", "TEMPLE"]);
  assert.ok(after.events.some((e) => e.type === "REGION_ENTER"));
  assert.deepEqual(
    step(control(after.state, "PAUSE"), [], createWorld(), r).state,
    control(after.state, "PAUSE"),
  );
});
test("3: integer travel clock matches core at speed/cycle boundaries including remainders", () => {
  const r = compileRules({
    ...RULES_V3,
    bambooMeters: 100,
    templeMeters: 100,
    mountainMeters: 100,
    castleMeters: 100,
  });
  let s = createState(seed, r);
  for (let i = 0; i < 9000; i++) {
    const previous = s.distance;
    s = step(s, [], createWorld(), r).state;
    if (i % 37 === 0 || s.journey!.cycle !== journeyAt(previous, 0, r).cycle) {
      assert.equal(tickAtDistance(s.distance, 0, r), s.tick);
      assert.equal(tickAtDistance(previous + 1, 0, r), s.tick);
    }
  }
});
test(
  "3: every pattern/variant has an exact-core no-damage witness at min/max speed with timing margins",
  { timeout: 180000 },
  async () => {
    const results = [];
    for (const speed of [360000, 440000, 520000, 600000])
      for (const variant of [0, 1] as const)
        for (const p of PATTERNS) {
          const r = compileRules({ ...RULES_V3, speed });
          assert.equal(admissible(p, r), true);
          const b = {
            index: 0,
            start: 0,
            end: BLOCK_SIZE,
            pattern: p.id,
            region: p.regions[0]!,
            cycle: 3,
            intensity: p.intensity,
            fallback: false,
          };
          const shape = materialize(b, r, 0, variant),
            world = createWorld(shape.gaps, shape.entities);
          for (const shift of [-3, 0, 3]) {
            const proof = solveWindow(
              world,
              r,
              createState(seed, r),
              BLOCK_SIZE,
              shift,
            );
            assert.ok(
              proof,
              `${p.id}, speed ${speed}, variant ${variant}, shift ${shift}`,
            );
            assert.equal(proof.state.hp, 3);
            assert.ok(proof.state.grounded);
            assert.equal(proof.state.combat!.specials >= 0, true);
            results.push({
              pattern: p.id,
              speed,
              variant,
              shift,
              nodes: proof.nodes,
              commands: proof.commands,
            });
          }
        }
    await mkdir("artifacts/phase-3", { recursive: true });
    await writeFile(
      "artifacts/phase-3/pattern-witnesses.json",
      JSON.stringify(results),
    );
  },
);
test(
  "3: 10,000 seeds across four regions/five cycles respect gates, corridors, density and stable windows",
  { timeout: 120000 },
  () => {
    const seen = new Set<string>(),
      archetypes = new Set<string>();
    let checked = 0;
    for (let n = 0; n < 10000; n++) {
      const s = n.toString(16).padStart(32, "0");
      for (let cycle = 0; cycle < 5; cycle++)
        for (let region = 0; region < 4; region++)
          for (let sample = 0; sample < 3; sample++) {
            const r = RULES_V3,
              offset =
                regionLengths(r)
                  .slice(0, region)
                  .reduce((a, b) => a + b, 0) +
                cycle * 320000000,
              index = Math.floor((offset + 12000000) / BLOCK_SIZE) + sample,
              b = blockAt(s, index, r);
            if (b.pattern !== "REST") {
              const p = PATTERNS.find((p) => p.id === b.pattern)!;
              assert.ok(p.regions.includes(b.region));
              assert.ok(p.minCycle <= b.cycle);
              assert.ok(p.steps.length <= 3);
              seen.add(p.id);
              const shape = materialize(b, r, 0, (n % 2) as 0 | 1);
              for (const e of shape.entities)
                if (e.actor) archetypes.add(e.actor.archetype);
              for (const g of shape.gaps) assert.ok(g.end - g.start >= 180000);
            }
            assert.equal(
              blockAt(s, index - (index % 4) + 3, r).pattern,
              "REST",
            );
            checked++;
          }
    }
    assert.equal(checked, 600000);
    assert.equal(archetypes.size, 9);
    assert.ok(seen.size >= 12);
    const a = directorCourse(seed, 0, 24000000, RULES_V3),
      b = directorCourse(seed, 6000000, 12000000, RULES_V3);
    for (const e of b.entities) {
      const same = a.entities.find((x) => x.id === e.id);
      assert.deepEqual(e, same);
    }
  },
);
test("3: all nine actors have strict telegraph/active/recovery and bounded projectile phases", () => {
  const seen = new Set<string>();
  for (const p of PATTERNS) {
    const shape = materialize(
      {
        index: 0,
        start: 0,
        end: BLOCK_SIZE,
        pattern: p.id,
        region: p.regions[0]!,
        cycle: 3,
        intensity: p.intensity,
        fallback: false,
      },
      RULES_V3,
    );
    for (const e of shape.entities) {
      if (!e.actor) continue;
      const a = e.actor;
      seen.add(a.archetype);
      assert.equal(actorPhase(e, a.cue), "TELEGRAPH");
      assert.equal(actorPhase(e, a.active), "ACTIVE");
      assert.equal(actorPhase(e, a.recover), "RECOVERY");
      assert.equal(actorPhase(e, a.exit), "EXIT");
      assert.ok(a.active - a.cue >= 60);
      const world = createWorld([], shape.entities);
      const active = worldAtTick(world, a.active).entities.find(
        (x) => x.id === e.id,
      )!;
      assert.equal(active.phase, "ACTIVE");
      if (["E02", "E05", "E08"].includes(a.archetype)) {
        assert.ok(active.vulnerability);
        assert.equal(active.vulnerability.start, a.recover);
      }
    }
    for (const e of shape.entities.filter((e) => e.projectile)) {
      const a = e.projectile!;
      assert.equal(
        worldAtTick(createWorld([], [e]), a.born - 1).entities.length,
        0,
      );
      assert.equal(
        worldAtTick(createWorld([], [e]), a.until).entities.length,
        0,
      );
      assert.equal(
        worldAtTick(createWorld([], [e]), a.born, [
          { id: a.owner, tick: a.born - 1 },
        ]).entities.length,
        0,
      );
      assert.equal(
        worldAtTick(createWorld([], [e]), a.born, [
          { id: a.owner, tick: a.born + 1 },
        ]).entities.length,
        1,
      );
    }
  }
  assert.equal(seen.size, 9);
});

test(
  "3: no-damage witnesses concatenate through five complete default cycles with bounded live state",
  { timeout: 120000 },
  async () => {
    const { directorRun } = await import("./fixtures/director-run.ts");
    const run = directorRun(seed, RULES_V3, 1600000000);
    assert.equal(run.state.hp, 3);
    assert.equal(run.state.status, "RUNNING");
    assert.equal(run.state.journey!.cycle, 6);
    assert.equal(run.state.journey!.speed, 600000);
    assert.deepEqual(run.state.journey!.visited, [...REGIONS]);
    assert.ok(run.maxWorld < 100);
    assert.ok(run.maxResolved < 32);
    assert.ok(run.blocks >= 266);
    assert.ok(run.commands.some((c) => c.action === "JUMP"));
    assert.ok(run.commands.some((c) => c.action === "SLIDE"));
    await writeFile(
      "artifacts/phase-3/five-cycle-summary.json",
      JSON.stringify({
        ticks: run.state.tick,
        commands: run.commands.length,
        maxWorld: run.maxWorld,
        maxResolved: run.maxResolved,
        blocks: run.blocks,
      }),
    );
  },
);
test("3: every enemy can be defeated by legal inputs and awards only once; projectile deflection is not a kill", () => {
  const seen = new Set<string>();
  for (const pattern of PATTERNS)
    for (const variant of [0, 1] as const) {
      const shape = materialize(
        {
          index: 0,
          start: 0,
          end: BLOCK_SIZE,
          pattern: pattern.id,
          region: pattern.regions[0]!,
          cycle: 3,
          intensity: pattern.intensity,
          fallback: false,
        },
        RULES_V3,
        0,
        variant,
      );
      for (const enemy of shape.entities.filter((e) => e.actor)) {
        const key = enemy.actor!.archetype + variant;
        if (seen.has(key)) continue;
        seen.add(key);
        let success = false;
        for (const jumpLead of [30, 24, 18, 12, 0])
          for (const attackOffset of [-8, -4, 0, 4, 8]) {
            let state = createState(seed, RULES_V3),
              hits = 0;
            const ideal = enemy.idealTick!,
              world = createWorld([], [enemy]);
            while (
              state.tick < enemy.actor!.exit + 24 &&
              state.status === "RUNNING"
            ) {
              const actions: import("@ronin/runner-core").Action[] = [];
              if (jumpLead && state.tick === ideal - jumpLead)
                actions.push("JUMP" as const);
              if (state.tick === ideal - RULES_V3.attackWindup + attackOffset)
                actions.push("ATTACK" as const);
              const u = step(state, actions, world, RULES_V3);
              state = u.state;
              hits += u.events.filter((e) => e.type === "HIT").length;
            }
            if (state.kills === 1) {
              assert.equal(hits, 1);
              assert.ok(state.perfects <= 1);
              success = true;
              break;
            }
          }
        assert.ok(success, key);
      }
    }
  assert.equal(seen.size, 18);
  const arrow = {
    id: "arrow",
    kind: "PROJECTILE" as const,
    x: 120000,
    width: 20000,
    top: -25000,
    bottom: -5000,
    projectile: { owner: "archer", born: 0, until: 100, speed: -240000 },
  };
  let s = createState(seed, RULES_V3),
    deflects = 0;
  for (let i = 0; i < 24; i++) {
    const u = step(
      s,
      i === 0 ? ["ATTACK"] : [],
      createWorld([], [arrow]),
      RULES_V3,
    );
    s = u.state;
    deflects += u.events.filter((e) => e.type === "DEFLECT").length;
  }
  assert.equal(deflects, 1);
  assert.equal(s.kills, 0);
  assert.equal(s.combat!.concentration, 0);
  assert.equal(s.hp, 3);
});

test("3: long combat history prunes resolved IDs while every enemy awards once", () => {
  const enemies = Array.from({ length: 100 }, (_, i) => ({
      id: "stream-" + i,
      x: 120000 + i * 180000,
      width: 30000,
      top: -88000,
      bottom: 0,
      kind: "ENEMY" as const,
      idealTick: i * 30 + 4,
    })),
    world = createWorld([], enemies);
  let s = createState(seed, RULES_V3),
    maximum = 0;
  for (let tick = 0; tick < 3500; tick++) {
    s = step(s, tick % 30 === 0 ? ["ATTACK"] : [], world, RULES_V3).state;
    maximum = Math.max(maximum, s.resolved.length);
  }
  assert.equal(s.kills, 100);
  assert.equal(s.hp, 3);
  assert.ok(maximum > 0 && maximum < 16);
  assert.ok(s.resolved.length < maximum);
});

test("3: offscreen gap warning preserves at least 1.5 seconds before every certified jump lead", async () => {
  const { abyssAhead } = await import("@ronin/runner-client");
  for (const speed of [360000, 440000, 520000, 600000]) {
    const r = compileRules({ ...RULES_V3, speed }),
      s = createState(seed, r),
      lead = (speed * 3) / 2 + 340000,
      world = createWorld([{ start: lead, end: lead + 190000 }]);
    assert.equal(abyssAhead(s, world, r), true);
    assert.ok((lead - 340000) / speed >= 1.5);
    assert.equal(
      abyssAhead(s, createWorld([{ start: lead + 1, end: lead + 190001 }]), r),
      false,
    );
    assert.equal(abyssAhead(control(s, "PAUSE"), world, r), false);
  }
});

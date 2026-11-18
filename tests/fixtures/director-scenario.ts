import {
  RULES_V3,
  compileRules,
  createState,
  createWorld,
  step,
} from "@ronin/runner-core";
import { materialize, BLOCK_SIZE } from "@ronin/content/director";
import { solveWindow } from "@ronin/content/solver";
import { FixedClock } from "@ronin/runner-client";
import { canonical, stateHash } from "@ronin/contracts/canonical";
export async function directorScenario(fps: number) {
  const r = compileRules({
      ...RULES_V3,
      bambooMeters: 100,
      templeMeters: 100,
      mountainMeters: 100,
      castleMeters: 100,
    }),
    gaps = [],
    entities = [];
  for (const [index, pattern] of ["P08", "P09", "P12"].entries()) {
    const shape = materialize(
      {
        index,
        start: index * BLOCK_SIZE,
        end: (index + 1) * BLOCK_SIZE,
        region: "BAMBOO",
        cycle: 3,
        pattern,
        intensity: 2,
        fallback: false,
      },
      r,
      0,
      1,
    );
    gaps.push(...shape.gaps);
    entities.push(...shape.entities);
  }
  const world = createWorld(gaps, entities),
    initial = createState("0123456789abcdeffedcba9876543210", r),
    proof = solveWindow(world, r, initial, 3 * BLOCK_SIZE);
  if (!proof) throw new Error("fixture_unreachable");
  let state = initial,
    previous = 0;
  const clock = new FixedClock(),
    trace: string[] = [];
  for (let frame = 1; frame <= fps * 60; frame++) {
    const now = Math.floor((frame * 1000000) / fps);
    clock.advance(now - previous, () => {
      state = step(
        state,
        proof.commands
          .filter((c) => c.tick === state.tick)
          .map((c) => c.action),
        world,
        r,
      ).state;
      trace.push(canonical(state));
    });
    previous = now;
  }
  return { state, traceHash: await stateHash(trace), updates: trace.length };
}

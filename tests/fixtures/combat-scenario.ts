import { createState, createWorld, step, RULES_V2 } from "@ronin/runner-core";
import { FixedClock } from "@ronin/runner-client";
import { canonical, stateHash } from "@ronin/contracts/canonical";
export async function combatScenario(fps: number) {
  const enemies = Array.from({ length: 19 }, (_, i) => ({
    id: "e-" + i,
    kind: "ENEMY" as const,
    x: 120000 + i * 180000,
    width: 30000,
    top: -88000,
    bottom: 0,
    idealTick: i * 30 + 4,
  }));
  enemies.push({
    ...enemies[9]!,
    id: "extra-special",
    x: enemies[9]!.x + 80000,
  });
  const world = createWorld([], enemies),
    trace: string[] = [],
    clock = new FixedClock();
  let state = createState("0123456789abcdeffedcba9876543210", RULES_V2),
    previous = 0;
  for (let frame = 1; frame <= fps * 10; frame++) {
    const now = Math.floor((frame * 1000000) / fps);
    clock.advance(now - previous, () => {
      state = step(
        state,
        state.tick % 30 === 0 ? ["ATTACK"] : [],
        world,
        RULES_V2,
      ).state;
      trace.push(canonical(state));
    });
    previous = now;
  }
  return { state, updates: trace.length, traceHash: await stateHash(trace) };
}

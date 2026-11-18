import type { Action } from "@ronin/runner-core";
import { RULES_V4, bossSchedule, step } from "@ronin/runner-core";
import { entryAt } from "@ronin/content/solver";
import { bossCorridor } from "./boss-run.ts";
import { FixedClock } from "@ronin/runner-client";
import { createWorld } from "@ronin/runner-core";
import { canonical, stateHash } from "@ronin/contracts/canonical";
export async function bossScenario(fps: number) {
  const trace: string[] = [];
  let victories = 0,
    retreats = 0;
  for (const cycle of [1, 4])
    for (let region = 0; region < 4; region++) {
      const a = bossSchedule(
          (cycle - 1) * 320000000 +
            [0, 60000000, 140000000, 240000000][region]!,
          0,
          RULES_V4,
        ),
        initial = entryAt(a.warning, RULES_V4),
        proof = bossCorridor(initial, RULES_V4, cycle === 1),
        clock = new FixedClock();
      let state = initial,
        previous = 0,
        index = 0;
      for (let frame = 1; state.tick < proof.state.tick; frame++) {
        const now = Math.floor((frame * 1000000) / fps);
        clock.advance(now - previous, () => {
          if (state.tick >= proof.state.tick) return;
          const actions: Action[] = [];
          while (proof.commands[index]?.tick === state.tick)
            actions.push(proof.commands[index++]!.action);
          const u = step(state, actions, createWorld(), RULES_V4);
          state = u.state;
          for (const e of u.events) {
            if (e.type === "BOSS_DEFEATED") victories++;
            if (e.type === "BOSS_RETREATED") retreats++;
          }
          trace.push(canonical(state));
        });
        previous = now;
      }
    }
  return {
    traceHash: await stateHash(trace),
    updates: trace.length,
    victories,
    retreats,
  };
}

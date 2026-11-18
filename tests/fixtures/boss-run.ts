import {
  bossView,
  bossSchedule,
  createState,
  step,
  createWorld,
} from "@ronin/runner-core";
import type {
  Action,
  SimState,
  Rules,
  Region,
  BossOutcome,
} from "@ronin/runner-core";
import { directorCourse, BLOCK_SIZE } from "@ronin/content/director";
import { solveWindow } from "@ronin/content/solver";
import type { Command } from "@ronin/content/solver";
/** QA controller returns ordinary commands only; production has no checkpoint/start override. */
export function bossInputs(
  s: SimState,
  r: Rules,
  fight = true,
  margin = 0,
): Action[] {
  const v = bossView(s, r);
  if (v?.phase !== "ACTIVE" || v.result) return [];
  const delta = Math.floor(s.journey!.speed / 60),
    lead = (v.high ? 60000 : 90000) + margin * delta;
  if (
    s.distance + delta >= v.strike - lead &&
    s.distance < v.strike &&
    s.grounded &&
    s.tick >= s.slideRecoveryUntil
  )
    return [v.high ? "SLIDE" : "JUMP"];
  if (
    fight &&
    v.vulnerable &&
    s.bosses!.current?.usedWindow !== v.window &&
    s.tick >= s.slideUntil
  ) {
    if (v.aerial) {
      if (s.grounded) return ["JUMP"];
      if (s.jumps === 1 && s.y < -80000) return ["JUMP"];
      if (s.y >= -160000) return [];
    } else if (!s.grounded) return [];
    if (s.attackAge < 0) return ["ATTACK"];
  }
  return [];
}
export function bossCorridor(
  initial: SimState,
  r: Rules,
  fight = true,
  margin = 0,
) {
  let state = initial;
  const commands: Command[] = [],
    outcomes: BossOutcome[] = [],
    events = [];
  const end =
    bossSchedule(state.distance, state.journey!.worldOffset, r).exit + 10000;
  while (state.distance < end && state.status === "RUNNING") {
    const actions = bossInputs(state, r, fight, margin);
    commands.push(...actions.map((action) => ({ tick: state.tick, action })));
    const update = step(state, actions, createWorld(), r);
    state = update.state;
    events.push(...update.events);
    for (const e of update.events) if (e.boss) outcomes.push(e.boss);
  }
  return { state, commands, outcomes, events };
}
export function bossRun(
  seed: string,
  r: Rules,
  endDistance: number,
  region: Region = "BAMBOO",
  fight: boolean | ((cycle: number, region: Region) => boolean) = true,
) {
  let state = createState(seed, r, region);
  const commands: Command[] = [],
    outcomes: BossOutcome[] = [];
  while (state.distance < endDistance && state.status === "RUNNING") {
    const end = Math.min(
        endDistance,
        (Math.floor(state.distance / BLOCK_SIZE) + 1) * BLOCK_SIZE,
      ),
      schedule = bossSchedule(state.distance, state.journey!.worldOffset, r),
      world = directorCourse(seed, state.distance, end, r, region);
    if (end >= schedule.warning - 2000000) {
      while (state.distance < end && state.status === "RUNNING") {
        const actions = bossInputs(
          state,
          r,
          typeof fight === "boolean"
            ? fight
            : fight(state.journey!.cycle, state.journey!.region),
        );
        commands.push(
          ...actions.map((action) => ({ tick: state.tick, action })),
        );
        const u = step(state, actions, world, r);
        state = u.state;
        for (const e of u.events) if (e.boss) outcomes.push(e.boss);
      }
    } else {
      const proof = solveWindow(world, r, state, end);
      if (!proof) throw new Error("unreachable_boss_route_" + state.distance);
      commands.push(...proof.commands);
      state = proof.state;
    }
  }
  if (state.hp !== 3 || state.status !== "RUNNING")
    throw new Error("boss_route_damage_" + state.distance + "_" + state.hp);
  return { state, commands, outcomes };
}

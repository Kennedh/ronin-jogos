import { RULES_V1 } from "./rules.ts";
import type { Rules } from "./rules.ts";
import { step, control } from "./simulation.ts";
import type { SimState, Action } from "./simulation.ts";
import type { World } from "./world.ts";
export interface PlaybackInput {
  start_tick: number;
  end_tick: number;
  actions: readonly { tick: number; action: Action }[];
  controls: readonly {
    tick: number;
    sequence: number;
    action: "PAUSE" | "RESUME" | "QUIT";
  }[];
}
/** Pure ordered playback of an already decoded/validated interval. No DB or transport. */
export function playSegment(
  previous: SimState,
  input: PlaybackInput,
  world: World,
  onState?: (state: SimState) => void,
  rules: Rules = RULES_V1,
): SimState {
  if (
    previous.tick !== input.start_tick ||
    !Number.isSafeInteger(input.end_tick) ||
    input.end_tick < input.start_tick ||
    input.end_tick - input.start_tick > 3600
  )
    throw new RangeError("playback_interval");
  let state = previous,
    actionIndex = 0,
    controlIndex = 0;
  while (true) {
    while (
      controlIndex < input.controls.length &&
      input.controls[controlIndex]!.tick === state.tick
    ) {
      state = control(state, input.controls[controlIndex++]!.action);
    }
    if (state.tick === input.end_tick) break;
    if (state.status !== "RUNNING") throw new RangeError("tick_after_stop");
    const actions: Action[] = [];
    while (
      actionIndex < input.actions.length &&
      input.actions[actionIndex]!.tick === state.tick
    )
      actions.push(input.actions[actionIndex++]!.action);
    state = step(state, actions, world, rules).state;
    onState?.(state);
  }
  if (
    actionIndex !== input.actions.length ||
    controlIndex !== input.controls.length
  )
    throw new RangeError("unused_replay_events");
  return state;
}

export {
  TICK_RATE,
  RULES_V1,
  RULES_V2,
  RULES_V3,
  directorRules,
  combatRules,
  compileRules,
} from "./rules.ts";
export { integer, add, divideStep, assertTick, nextTick } from "./math.ts";
export { createRandom, randomNext } from "./rng.ts";
export type { RandomState, RandomStream } from "./rng.ts";
export { createWorld } from "./world.ts";
export type { World, Entity, Gap } from "./world.ts";
export { createState, step, control } from "./simulation.ts";
export type {
  Action,
  SimState,
  SimEvent,
  EndReason,
  CombatState,
} from "./simulation.ts";

export { playSegment } from "./playback.ts";
export type { PlaybackInput } from "./playback.ts";

export type { Rules, CombatRules, DirectorRules } from "./rules.ts";

export {
  REGIONS,
  journeyAt,
  regionLengths,
  startOffset,
  tickAtDistance,
} from "./journey.ts";
export type { Journey, Region } from "./journey.ts";
export { actorPhase, worldAtTick } from "./actors.ts";
export type { Archetype, ActorScript, ActorPhase } from "./world.ts";

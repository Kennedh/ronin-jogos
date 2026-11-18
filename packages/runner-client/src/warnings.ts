import type { SimState, World, Rules } from "@ronin/runner-core";
/** Covers 1.5 s before the earliest certified jump (340u lead), even off screen. */
export function abyssAhead(
  state: SimState,
  world: World,
  rules: Rules,
): boolean {
  if (!state.journey || state.status !== "RUNNING") return false;
  const lead =
    (Math.min(rules.speedCeiling, state.journey.speed) * 3) / 2 + 340000;
  return world.gaps.some(
    (g) => g.start >= state.distance && g.start - state.distance <= lead,
  );
}

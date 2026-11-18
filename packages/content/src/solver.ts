import {
  createState,
  step,
  tickAtDistance,
  journeyAt,
} from "@ronin/runner-core";
import type { SimState, Action, World, Rules } from "@ronin/runner-core";
export interface Command {
  tick: number;
  action: Action;
}
export interface Witness {
  state: SimState;
  commands: Command[];
  nodes: number;
}
/** Positive certificate only: bounded macro search, each candidate runs through the real core. */
export function solveWindow(
  world: World,
  r: Rules,
  initial: SimState,
  endDistance: number,
  shift = 0,
): Witness | undefined {
  const groups = [
    ...world.gaps.map((g) => ({ x: g.start, long: g.end - g.start > 240000 })),
    ...world.entities
      .filter((e) => e.kind !== "PROJECTILE")
      .map((e) => ({ x: e.x, long: false })),
  ]
    .filter((g) => g.x >= initial.distance && g.x < endDistance)
    .sort((a, b) => a.x - b.x);
  let state = initial,
    nodes = 0;
  const commands: Command[] = [];
  const offset = initial.journey?.worldOffset ?? 0;
  for (let index = 0; index < groups.length; index++) {
    const hazard = groups[index]!,
      end = Math.min(
        endDistance,
        hazard.x + 850000,
        groups[index + 1] ? groups[index + 1]!.x - 450000 : endDistance,
      );
    const candidates: Command[][] = [[]];
    for (const lead of [
      140000, 180000, 100000, 60000, 220000, 260000, 300000, 340000,
    ]) {
      const tick = Math.max(
        state.tick,
        tickAtDistance(Math.max(0, hazard.x - lead), offset, r) + shift,
      );
      candidates.push(
        [{ tick, action: "JUMP" }],
        [{ tick, action: "SLIDE" }],
        [{ tick, action: "ATTACK" }],
      );
      for (const delay of [12, 18, 24])
        candidates.push([
          { tick, action: "JUMP" },
          { tick: tick + delay, action: "JUMP" },
        ]);
    }
    let found: SimState | undefined,
      used: Command[] = [];
    const evaluate = (candidate: Command[], delta = 0) => {
      let s = state;
      while (s.distance < end && s.status === "RUNNING" && s.hp === state.hp) {
        s = step(
          s,
          candidate
            .filter((c) => c.tick + delta === s.tick)
            .map((c) => c.action),
          world,
          r,
        ).state;
        nodes++;
      }
      return s.status === "RUNNING" &&
        s.hp === state.hp &&
        s.grounded &&
        s.attackAge < 0 &&
        s.tick >= s.slideRecoveryUntil
        ? s
        : undefined;
    };
    for (const candidate of candidates) {
      const s = evaluate(candidate);
      if (!s) continue;
      if (
        candidate.length &&
        (!evaluate(candidate, -3) || !evaluate(candidate, 3))
      )
        continue;
      found = s;
      used = candidate;
      break;
    }
    if (!found) return;
    state = found;
    commands.push(...used);
  }
  while (
    state.distance < endDistance &&
    state.status === "RUNNING" &&
    state.hp === initial.hp
  ) {
    state = step(state, [], world, r).state;
    nodes++;
  }
  if (state.status !== "RUNNING" || state.hp !== initial.hp || !state.grounded)
    return;
  return { state, commands, nodes };
}
/** Neutral entry fixture at an exact reachable tick (never a client-submitted checkpoint). */
export function entryAt(distance: number, r: Rules, offset = 0): SimState {
  let s = createState("0123456789abcdeffedcba9876543210", r),
    remaining = distance;
  // Compute integration in at most four speed tiers instead of replaying empty kilometres.
  let position = 0,
    remainder = 0,
    tick = 0;
  while (remaining > 0) {
    const j = journeyAt(position, offset, r),
      target = Math.min(distance, j.regionEnd),
      next = tickAtDistance(target, offset, r),
      n = next - tick;
    const numerator = BigInt(j.speed) * BigInt(n) + BigInt(remainder);
    const dx = Number(numerator / 60n);
    remainder = Number(numerator % 60n);
    position += dx;
    tick = next;
    remaining = distance - position;
  }
  s = {
    ...s,
    tick,
    distance: position,
    xRemainder: remainder,
    lastGroundedTick: Math.max(0, tick - 1),
    ...(s.journey ? { journey: journeyAt(position, offset, r) } : {}),
  };
  return s;
}

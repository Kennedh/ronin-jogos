import { integer, add } from "./math.ts";
export type Archetype =
  "E01" | "E02" | "E03" | "E04" | "E05" | "E06" | "E07" | "E08" | "E09";
export type ActorPhase =
  "SPAWN" | "APPROACH" | "TELEGRAPH" | "ACTIVE" | "RECOVERY" | "EXIT";
export interface ActorScript {
  archetype: Archetype;
  cue: number;
  active: number;
  recover: number;
  exit: number;
  variant: 0 | 1;
}
export interface ProjectileScript {
  owner: string;
  born: number;
  until: number;
  speed: number;
}
export interface Gap {
  start: number;
  end: number;
}
export interface Entity {
  id: string;
  x: number;
  width: number;
  top: number;
  bottom: number;
  kind: "OBSTACLE" | "ENEMY" | "PROJECTILE";
  actor?: ActorScript;
  projectile?: ProjectileScript;
  damageOwner?: string;
  hazard?: boolean;
  hidden?: boolean;
  phase?: ActorPhase;
  idealTick?: number;
  vulnerability?: { readonly start: number; readonly end: number };
  specialEligible?: boolean;
}
export interface World {
  readonly gaps: readonly Gap[];
  readonly entities: readonly Entity[];
}
export function createWorld(
  gaps: readonly Gap[] = [],
  entities: readonly Entity[] = [],
): World {
  const ids = new Set<string>();
  const sorted = gaps.map((g) => ({ ...g })).sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length; i++) {
    const g = sorted[i]!;
    integer(g.start);
    integer(g.end);
    if (
      g.start < 0 ||
      g.end <= g.start ||
      (i > 0 && sorted[i - 1]!.end > g.start)
    )
      throw new RangeError("invalid_gap");
  }
  const bodies = entities
    .map((e) => ({ ...e }))
    .sort((a, b) => a.x - b.x || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const e of bodies) {
    integer(e.x);
    integer(e.width);
    integer(e.top);
    integer(e.bottom);
    add(e.x, e.width);
    if (
      !e.id ||
      ids.has(e.id) ||
      e.width <= 0 ||
      e.bottom <= e.top ||
      !["ENEMY", "OBSTACLE", "PROJECTILE"].includes(e.kind)
    )
      throw new RangeError("invalid_entity");
    if (e.idealTick !== undefined && integer(e.idealTick) < 0)
      throw new RangeError("invalid_telegraph");
    if (e.vulnerability) {
      if (
        integer(e.vulnerability.start) < 0 ||
        integer(e.vulnerability.end) <= e.vulnerability.start
      )
        throw new RangeError("invalid_vulnerability");
      e.vulnerability = Object.freeze({ ...e.vulnerability });
    }
    if (
      e.specialEligible !== undefined &&
      typeof e.specialEligible !== "boolean"
    )
      throw new RangeError("invalid_special_eligibility");
    if (e.actor) {
      const a = e.actor;
      if (
        !/^E0[1-9]$/.test(a.archetype) ||
        ![a.cue, a.active, a.recover, a.exit].every(
          (n) => Number.isSafeInteger(n) && n >= 0,
        ) ||
        a.cue >= a.active ||
        a.active >= a.recover ||
        a.recover >= a.exit ||
        ![0, 1].includes(a.variant)
      )
        throw new RangeError("invalid_actor");
      e.actor = Object.freeze({ ...a });
    }
    if (e.projectile) {
      const p = e.projectile;
      if (
        !p.owner ||
        !Number.isSafeInteger(p.born) ||
        p.born < 0 ||
        !Number.isSafeInteger(p.until) ||
        p.until <= p.born ||
        !Number.isSafeInteger(p.speed) ||
        p.speed >= 0
      )
        throw new RangeError("invalid_projectile");
      e.projectile = Object.freeze({ ...p });
    }
    ids.add(e.id);
    Object.freeze(e);
  }
  return Object.freeze({
    gaps: Object.freeze(sorted.map((g) => Object.freeze(g))),
    entities: Object.freeze(bodies),
  });
}
export function supported(world: World, x: number): boolean {
  return !world.gaps.some((g) => x >= g.start && x < g.end);
}
export function overlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
): boolean {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

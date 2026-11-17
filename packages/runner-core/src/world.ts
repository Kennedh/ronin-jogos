import { integer, add } from "./math.ts";
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
  kind: "OBSTACLE" | "ENEMY";
  idealTick?: number;
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
      !["ENEMY", "OBSTACLE"].includes(e.kind)
    )
      throw new RangeError("invalid_entity");
    if (e.idealTick !== undefined && integer(e.idealTick) < 0)
      throw new RangeError("invalid_telegraph");
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

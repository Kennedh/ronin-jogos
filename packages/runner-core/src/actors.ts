import type { Entity, World, ActorPhase } from "./world.ts";
import { add } from "./math.ts";
export function actorPhase(e: Entity, tick: number): ActorPhase {
  const a = e.actor;
  if (!a) return "APPROACH";
  return tick < a.cue - 60
    ? "SPAWN"
    : tick < a.cue
      ? "APPROACH"
      : tick < a.active
        ? "TELEGRAPH"
        : tick < a.recover
          ? "ACTIVE"
          : tick < a.exit
            ? "RECOVERY"
            : "EXIT";
}
export function worldAtTick(
  world: World,
  tick: number,
  resolved: readonly { id: string; tick?: number }[] = [],
): World {
  const entities: Entity[] = [];
  for (const raw of world.entities) {
    if (raw.projectile) {
      const p = raw.projectile,
        killed = resolved.find((x) => x.id === p.owner);
      if (
        tick < p.born ||
        tick >= p.until ||
        (killed && killed.tick !== undefined && killed.tick < p.born)
      )
        continue;
      entities.push({
        ...raw,
        x: add(raw.x, Number((BigInt(p.speed) * BigInt(tick - p.born)) / 60n)),
        phase: "ACTIVE",
      });
      continue;
    }
    if (!raw.actor) {
      entities.push(raw);
      continue;
    }
    const a = raw.actor,
      phase = actorPhase(raw, tick);
    if (phase === "SPAWN" || phase === "EXIT") continue;
    let x = raw.x,
      top = raw.top,
      bottom = raw.bottom;
    const age = Math.max(0, Math.min(tick - a.active, a.recover - a.active));
    if (a.archetype === "E02") x -= Math.min(age, 10) * 6000;
    if (a.archetype === "E06") {
      x -= Math.min(age, 10) * 9000;
      if (phase === "ACTIVE") {
        const lift =
          Math.min(age, Math.max(0, a.recover - a.active - age)) * 6000;
        top -= lift;
        bottom -= lift;
      }
    }
    if (a.archetype === "E08") x -= Math.min(age, 10) * 4000;
    if (a.archetype === "E03") {
      const lift =
        phase === "ACTIVE"
          ? Math.min(age, 8) * 6000
          : phase === "RECOVERY"
            ? Math.max(0, 8 - (tick - a.recover)) * 6000
            : 0;
      top += lift;
      bottom += lift;
    }
    const guarded = ["E02", "E05", "E08"].includes(a.archetype),
      shadow = a.archetype === "E09";
    entities.push({
      ...raw,
      x,
      top,
      bottom,
      phase,
      hazard: !shadow || phase === "ACTIVE",
      ...(guarded
        ? { vulnerability: { start: a.recover, end: a.exit } }
        : shadow
          ? { vulnerability: { start: a.active, end: a.exit } }
          : {}),
    });
    if (
      phase === "ACTIVE" &&
      ["E01", "E02", "E05", "E08"].includes(a.archetype)
    ) {
      const reach =
        a.archetype === "E02" ? 150000 : a.archetype === "E05" ? 120000 : 70000;
      const high = a.archetype === "E08" && a.variant === 1;
      entities.push({
        id: raw.id + "#strike",
        kind: "OBSTACLE",
        x: x - reach,
        width: reach,
        top: a.archetype === "E02" ? top + 46000 : high ? -105000 : -40000,
        bottom: a.archetype === "E02" ? top + 62000 : high ? -48000 : 0,
        damageOwner: raw.id,
        hidden: true,
      });
    }
  }
  return { gaps: world.gaps, entities };
}

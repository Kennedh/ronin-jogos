import {
  createWorld,
  createRandom,
  randomNext,
  journeyAt,
  regionLengths,
  startOffset,
  tickAtDistance,
  add,
  bossRules,
  bossSchedule,
} from "@ronin/runner-core";
import type { Region, Rules, Archetype, Entity, Gap } from "@ronin/runner-core";
export type StepKind = "LOW" | "HIGH" | "GAP" | "LONG_GAP" | Archetype;
export interface Pattern {
  id: string;
  regions: readonly Region[];
  minCycle: number;
  steps: readonly StepKind[];
  intensity: 0 | 1 | 2;
}
const BT = ["BAMBOO", "TEMPLE"] as const,
  TC = ["TEMPLE", "CASTLE"] as const;
export const PATTERNS: readonly Pattern[] = Object.freeze([
  {
    id: "P01",
    regions: ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"],
    minCycle: 1,
    steps: ["LOW"],
    intensity: 0,
  },
  { id: "P02", regions: BT, minCycle: 1, steps: ["HIGH"], intensity: 0 },
  { id: "P03", regions: BT, minCycle: 1, steps: ["E01"], intensity: 0 },
  { id: "P04", regions: BT, minCycle: 1, steps: ["LOW", "E01"], intensity: 1 },
  { id: "P05", regions: BT, minCycle: 1, steps: ["HIGH", "GAP"], intensity: 1 },
  {
    id: "P06",
    regions: ["BAMBOO"],
    minCycle: 1,
    steps: ["GAP", "HIGH"],
    intensity: 1,
  },
  { id: "P07", regions: BT, minCycle: 1, steps: ["E02"], intensity: 1 },
  {
    id: "P08",
    regions: ["TEMPLE"],
    minCycle: 1,
    steps: ["E04", "LOW"],
    intensity: 2,
  },
  {
    id: "P09",
    regions: ["MOUNTAINS"],
    minCycle: 1,
    steps: ["LONG_GAP", "E06"],
    intensity: 2,
  },
  {
    id: "P10",
    regions: ["MOUNTAINS"],
    minCycle: 1,
    steps: ["HIGH", "E07"],
    intensity: 1,
  },
  {
    id: "P11",
    regions: ["CASTLE"],
    minCycle: 1,
    steps: ["HIGH", "GAP"],
    intensity: 1,
  },
  {
    id: "P12",
    regions: ["CASTLE"],
    minCycle: 2,
    steps: ["E08", "LONG_GAP", "E03"],
    intensity: 2,
  },
  {
    id: "P13",
    regions: ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"],
    minCycle: 3,
    steps: ["E09"],
    intensity: 2,
  },
  { id: "P14", regions: TC, minCycle: 1, steps: ["E05"], intensity: 1 },
  {
    id: "P15",
    regions: ["BAMBOO", "CASTLE"],
    minCycle: 2,
    steps: ["E03"],
    intensity: 1,
  },
  {
    id: "P16",
    regions: ["CASTLE"],
    minCycle: 1,
    steps: ["E04", "E08"],
    intensity: 2,
  },
]);
export const BLOCK_SIZE = 6000000;
export const STEP_SPACING = 1500000;
export const FIRST_HAZARD = 1250000;
export interface Block {
  index: number;
  start: number;
  end: number;
  pattern: string;
  region: Region;
  cycle: number;
  intensity: number;
  fallback: boolean;
}
function choice(seed: string, index: number) {
  const modulus = (1n << 128n) - 1n;
  const mixed =
    (BigInt("0x" + seed) + BigInt(index) * 0x9e3779b97f4a7c15n) & modulus;
  let state = createRandom(mixed.toString(16).padStart(32, "0"), "world");
  for (let warmup = 0; warmup < 4; warmup++) state = randomNext(state).state;
  return randomNext(state).value;
}
export function blockAt(
  seed: string,
  index: number,
  r: Rules,
  offset = 0,
): Block {
  if (!Number.isSafeInteger(index) || index < 0)
    throw new Error("invalid_block");
  const start = index * BLOCK_SIZE,
    end = add(start, BLOCK_SIZE),
    j = journeyAt(start, offset, r),
    regionPosition = start - j.regionStart;
  const neutral = { index, start, end, region: j.region, cycle: j.cycle };
  // Reserve a full safe corridor at region transitions and the future boss encounter.
  if (
    (bossRules(r) && end >= bossSchedule(start, offset, r).warning - 2000000) ||
    start + FIRST_HAZARD < j.regionStart + 1000000 ||
    end > j.regionEnd - 6000000 ||
    index % 4 === 3
  )
    return { ...neutral, pattern: "REST", intensity: 0, fallback: false };
  const level = Math.max(
    regionPosition * 100 > (j.regionEnd - j.regionStart) * 65 ? 1 : 0,
    Math.min(2, (index % 4) + j.corruption),
  );
  let pool = PATTERNS.filter(
    (p) =>
      p.regions.includes(j.region) &&
      p.minCycle <= j.cycle &&
      p.intensity <= level,
  );
  if (
    j.region === "BAMBOO" &&
    j.cycle === 1 &&
    regionPosition < (j.regionEnd - j.regionStart) * 0.65
  )
    pool = pool.filter((p) => !p.steps.includes("E02"));
  const candidate = pool[choice(seed, index) % pool.length];
  const picked = candidate && admissible(candidate, r) ? candidate : undefined;
  return {
    ...neutral,
    pattern: picked?.id ?? "REST",
    intensity: picked?.intensity ?? 0,
    fallback: !picked,
  };
}
export function materialize(
  block: Block,
  r: Rules,
  offset = 0,
  variant: 0 | 1 = 0,
): { gaps: Gap[]; entities: Entity[] } {
  const gaps: Gap[] = [],
    entities: Entity[] = [],
    pattern = PATTERNS.find((p) => p.id === block.pattern);
  if (!pattern) return { gaps, entities };
  pattern.steps.forEach((kind, i) => {
    const x = add(block.start, FIRST_HAZARD + i * STEP_SPACING),
      id = `d3-${block.index}-${i}`;
    if (kind === "GAP" || kind === "LONG_GAP") {
      gaps.push({ start: x, end: add(x, kind === "GAP" ? 190000 : 280000) });
      return;
    }
    if (kind === "LOW" || kind === "HIGH") {
      entities.push({
        id,
        x,
        width: kind === "LOW" ? 50000 : 100000,
        top: kind === "LOW" ? -65000 : -160000,
        bottom: kind === "LOW" ? 0 : -55000,
        kind: "OBSTACLE",
      });
      return;
    }
    const ideal =
      tickAtDistance(x - r.bodyWidth / 2 - r.swordReach / 2, offset, r) - 1;
    const recover = ideal + 2,
      active = ideal - 8,
      cue = Math.max(0, active - 72),
      exit = ideal + 48;
    const aerial = kind === "E03" || (kind === "E09" && variant === 1);
    const body: Entity = {
      id,
      x,
      width: kind === "E05" ? 90000 : kind === "E06" ? 60000 : 40000,
      top: aerial
        ? -165000
        : kind === "E02"
          ? -125000
          : kind === "E06"
            ? -42000
            : -88000,
      bottom: aerial ? -110000 : 0,
      kind: "ENEMY",
      idealTick: ["E02", "E05", "E08"].includes(kind) ? recover + 4 : ideal,
      actor: { archetype: kind, cue, active, recover, exit, variant },
    };
    entities.push(body);
    if (kind === "E04" || kind === "E07") {
      const shots = kind === "E07" ? 3 : 1;
      for (let shot = 0; shot < shots; shot++) {
        const born = active - 16 + shot * 5;
        entities.push({
          id: id + "-projectile-" + shot,
          x,
          width: 24000,
          top: variant === 1 ? -78000 : -24000,
          bottom: variant === 1 ? -62000 : -8000,
          kind: "PROJECTILE",
          projectile: { owner: id, born, until: born + 120, speed: -240000 },
        });
      }
    }
  });
  return { gaps, entities };
}
export function directorCourse(
  seed: string,
  distance: number,
  end: number,
  r: Rules,
  region: Region = "BAMBOO",
) {
  // Validate seed independently of whether this particular window is a rest corridor.
  createRandom(seed, "world");
  if (
    !Number.isSafeInteger(distance) ||
    distance < 0 ||
    !Number.isSafeInteger(end) ||
    end < distance ||
    end - distance > 40000000
  )
    throw new Error("invalid_course_window");
  const offset = startOffset(region, r),
    first = Math.max(0, Math.floor((distance - 2000000) / BLOCK_SIZE)),
    last = Math.floor(add(end, 2000000) / BLOCK_SIZE),
    gaps: Gap[] = [],
    entities: Entity[] = [];
  for (let index = first; index <= last; index++) {
    const block = blockAt(seed, index, r, offset);
    const shape = materialize(
      block,
      r,
      offset,
      (choice(seed, index) % 2) as 0 | 1,
    );
    gaps.push(...shape.gaps);
    entities.push(...shape.entities);
  }
  return createWorld(gaps, entities);
}
export function directorPosition(
  distance: number,
  r: Rules,
  region: Region = "BAMBOO",
) {
  return journeyAt(distance, startOffset(region, r), r);
}
export { regionLengths };

/** Cheap runtime guard. Full core witnesses are generated and reexecuted by QA. */
export function admissible(p: Pattern, r: Rules) {
  return (
    p.steps.length > 0 &&
    p.steps.length <= 3 &&
    STEP_SPACING >= r.speedCeiling * 2 &&
    FIRST_HAZARD >= r.speedCeiling * 1.5 &&
    p.steps.every((k) =>
      [
        "LOW",
        "HIGH",
        "GAP",
        "LONG_GAP",
        "E01",
        "E02",
        "E03",
        "E04",
        "E05",
        "E06",
        "E07",
        "E08",
        "E09",
      ].includes(k),
    )
  );
}

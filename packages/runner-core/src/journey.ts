import { integer, add } from "./math.ts";
import { directorRules } from "./rules.ts";
import type { Rules } from "./rules.ts";
export const REGIONS = ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"] as const;
export type Region = (typeof REGIONS)[number];
export interface Journey {
  region: Region;
  cycle: number;
  corruption: number;
  speed: number;
  worldOffset: number;
  regionStart: number;
  regionEnd: number;
  visited: readonly Region[];
}
export function regionLengths(r: Rules) {
  const d = directorRules(r);
  if (!d) throw new Error("director_required");
  return [d.bambooMeters, d.templeMeters, d.mountainMeters, d.castleMeters].map(
    (m) => m * r.scale * r.unitsPerMeter,
  );
}
export function startOffset(region: Region, r: Rules) {
  const index = REGIONS.indexOf(region);
  if (index < 0) throw new Error("invalid_region");
  return regionLengths(r)
    .slice(0, index)
    .reduce((a, b) => add(a, b), 0);
}
export function journeyAt(distance: number, offset: number, r: Rules): Journey {
  integer(distance);
  integer(offset);
  if (distance < 0 || offset < 0) throw new Error("invalid_journey");
  const lengths = regionLengths(r),
    total = lengths.reduce((a, b) => add(a, b), 0),
    position = add(distance, offset),
    cycle = Number(BigInt(position) / BigInt(total)) + 1,
    corruption = Math.min(cycle - 1, 3);
  let within = Number(BigInt(position) % BigInt(total)),
    index = 0,
    start = position - within;
  while (index < 3 && within >= lengths[index]!) {
    within -= lengths[index]!;
    start += lengths[index++]!;
  }
  const initial = regionLengths(r);
  let initialIndex = 0,
    remaining = offset;
  while (initialIndex < 3 && remaining >= initial[initialIndex]!) {
    remaining -= initial[initialIndex++]!;
  }
  const visited: Region[] = [];
  let boundary = offset - remaining;
  for (let n = 0; n < 4; n++) {
    const idx = (initialIndex + n) % 4;
    if (boundary > position) break;
    visited.push(REGIONS[idx]!);
    boundary = add(boundary, initial[idx]!);
  }
  return {
    visited,
    region: REGIONS[index]!,
    cycle,
    corruption,
    speed: Math.min(
      r.speedCeiling,
      r.speed + corruption * directorRules(r)!.cycleSpeedStep,
    ),
    worldOffset: offset,
    regionStart: start - offset,
    regionEnd: add(start, lengths[index]!) - offset,
  };
}
/** Exact inverse of the core's integer integration, including cycle overshoot/remainders. */
export function tickAtDistance(
  target: number,
  offset: number,
  r: Rules,
): number {
  integer(target);
  if (target <= 0) return 0;
  const total = regionLengths(r).reduce((a, b) => a + b, 0);
  let distance = 0,
    ticks = 0,
    remainder = 0;
  while (distance < target) {
    const j = journeyAt(distance, offset, r),
      nextBoundary = add(j.cycle * total, -offset),
      end = j.corruption === 3 ? target : Math.min(target, nextBoundary),
      needed = end - distance;
    const n = Number(
      (BigInt(needed) * 60n - BigInt(remainder) + BigInt(j.speed) - 1n) /
        BigInt(j.speed),
    );
    const scaled = BigInt(j.speed) * BigInt(n) + BigInt(remainder);
    distance = add(distance, Number(scaled / 60n));
    remainder = Number(scaled % 60n);
    ticks = add(ticks, n);
  }
  return ticks;
}

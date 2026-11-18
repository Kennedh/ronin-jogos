import { journeyAt } from "./journey.ts";
import type { Region } from "./journey.ts";
import type { Rules } from "./rules.ts";
import type { SimState, SimEvent } from "./simulation.ts";
import type { Entity } from "./world.ts";
export const BOSS_IDS = ["B01", "B02", "B03", "B04"] as const;
export type BossId = (typeof BOSS_IDS)[number];
export type BossPhase =
  | "SCHEDULED"
  | "WARNING"
  | "ENTERING"
  | "ACTIVE"
  | "DEFEATED"
  | "RETREATED"
  | "EXITING"
  | "COMPLETED";
export interface BossOutcome {
  instance: string;
  boss: BossId;
  cycle: number;
  region: Region;
  result: "DEFEATED" | "RETREATED";
  tick: number;
  hits: number;
  bonus: number;
}
export interface BossEncounter {
  instance: string;
  boss: BossId;
  cycle: number;
  region: Region;
  hits: number;
  usedWindow: number;
  result: "DEFEATED" | "RETREATED" | null;
  resultTick: number;
}
export interface BossState {
  seed: string;
  current: BossEncounter | null;
  defeats: number[];
  retreats: number[];
  bonus: string;
  seals: number;
}
export const BOSS_PROFILES = Object.freeze([
  { id: "B01", meters: 240, hits: 3, opportunities: 5, bonus: 300 },
  { id: "B02", meters: 300, hits: 4, opportunities: 6, bonus: 450 },
  { id: "B03", meters: 360, hits: 5, opportunities: 8, bonus: 600 },
  { id: "B04", meters: 420, hits: 6, opportunities: 9, bonus: 900 },
] as const);
for (const profile of BOSS_PROFILES) Object.freeze(profile);
export function bossInitial(seed: string): BossState {
  return {
    seed,
    current: null,
    defeats: [0, 0, 0, 0],
    retreats: [0, 0, 0, 0],
    bonus: "0",
    seals: 0,
  };
}
export function bossSchedule(distance: number, offset: number, r: Rules) {
  const j = journeyAt(distance, offset, r),
    index = ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"].indexOf(j.region),
    profile = BOSS_PROFILES[index]!;
  const unit = r.scale * r.unitsPerMeter,
    end = j.regionEnd - 60 * unit,
    start = end - profile.meters * unit;
  return {
    ...j,
    profile,
    index,
    start,
    end,
    warning: start - 80 * unit,
    entering: start - 20 * unit,
    exit: Math.min(j.regionEnd, end + 40 * unit),
    instance: `b4:${j.cycle}:${j.region}:${profile.id}`,
  };
}
export function bossView(s: SimState, r: Rules) {
  if (!s.bosses || !s.journey) return undefined;
  const a = bossSchedule(s.distance, s.journey.worldOffset, r),
    c = s.bosses.current?.instance === a.instance ? s.bosses.current : null;
  let phase: BossPhase =
    s.distance < a.warning
      ? "SCHEDULED"
      : s.distance < a.entering
        ? "WARNING"
        : s.distance < a.start
          ? "ENTERING"
          : s.distance <= a.end
            ? "ACTIVE"
            : s.distance < a.exit
              ? "EXITING"
              : "COMPLETED";
  if (c?.result)
    phase =
      s.tick - c.resultTick < 45
        ? c.result
        : s.distance < a.exit
          ? "EXITING"
          : "COMPLETED";
  const span = a.end - a.start,
    position = Math.max(0, Math.min(span, s.distance - a.start));
  const window = Math.min(
    a.profile.opportunities - 1,
    Math.floor((position * a.profile.opportunities) / span),
  );
  const begin = a.start + Math.floor((span * window) / a.profile.opportunities),
    finish =
      a.start + Math.floor((span * (window + 1)) / a.profile.opportunities);
  const strike = begin + 1000000,
    recovery = strike + 240000;
  const pattern = Number(BigInt("0x" + s.bosses.seed) % 2n);
  const variation = (a.cycle - 1) % 3;
  const flip =
    (variation === 1 && window % 3 === 0) ||
    (variation === 2 && window % 3 !== 0);
  const lunge = a.profile.id === "B04" && window % 3 === 2;
  const high = !lunge && (window + pattern + (flip ? 1 : 0)) % 2 === 1;
  const aerial = a.profile.id === "B03" && window % 3 === 2;
  return {
    ...a,
    phase,
    hits: c?.hits ?? 0,
    window,
    begin,
    finish,
    strike,
    recovery,
    high,
    lunge,
    aerial,
    telegraph: phase === "ACTIVE" && s.distance < strike,
    attacking:
      phase === "ACTIVE" &&
      s.distance >= strike &&
      s.distance < strike + 120000,
    vulnerable:
      phase === "ACTIVE" &&
      s.distance >= recovery &&
      s.distance <= finish &&
      !c?.result,
    remaining: c?.result
      ? 0
      : Math.max(
          0,
          a.profile.opportunities - window - (c?.usedWindow === window ? 1 : 0),
        ),
    result: c?.result ?? null,
  };
}
/** Position-independent corridor: only announced attack boxes hurt; the boss body never does. */
export function bossHazard(s: SimState, r: Rules): Entity | undefined {
  const v = bossView(s, r);
  if (!v?.attacking || s.bosses?.current?.result) return;
  return {
    id: v.instance + ":" + v.window,
    x: s.distance - 30000,
    width: 60000,
    top: v.high ? -150000 : -42000,
    bottom: v.high ? -55000 : 0,
    kind: "OBSTACLE",
    damageOwner: v.instance + ":" + v.window,
  };
}
export function enterBoss(s: SimState, r: Rules, events: SimEvent[]) {
  if (!s.bosses || !s.journey) return;
  const v = bossView(s, r)!;
  if (v.phase === "SCHEDULED" || v.phase === "COMPLETED") return;
  if (s.bosses.current?.instance !== v.instance) {
    s.bosses.current = {
      instance: v.instance,
      boss: v.profile.id,
      cycle: v.cycle,
      region: v.region,
      hits: 0,
      usedWindow: -1,
      result: null,
      resultTick: 0,
    };
    events.push({ tick: s.tick, type: "BOSS_WARNING", entity: v.instance });
  }
}
export function hitBoss(
  s: SimState,
  r: Rules,
  sword: { left: number; right: number; top: number; bottom: number },
  events: SimEvent[],
) {
  const v = bossView(s, r),
    c = s.bosses?.current;
  if (
    !v?.vulnerable ||
    !c ||
    c.instance !== v.instance ||
    c.usedWindow === v.window ||
    s.status !== "RUNNING"
  )
    return;
  const target = {
    left: s.distance + 60000,
    right: s.distance + 140000,
    top: v.aerial ? -245000 : -88000,
    bottom: v.aerial ? -170000 : 0,
  };
  if (!(
    sword.left < target.right &&
    sword.right > target.left &&
    sword.top < target.bottom &&
    sword.bottom > target.top
  ))
    return;
  c.usedWindow = v.window;
  c.hits++;
  const center = Math.floor((v.recovery + v.finish) / 2),
    ideal =
      Math.abs(s.distance - center) <=
      Math.floor((s.journey!.speed * r.perfectTicks) / 60);
  const combat = s.combat!;
  combat.attackHit = true;
  if (ideal) {
    s.perfects++;
    if (!combat.attackPerfect) {
      combat.combo++;
      combat.bestCombo = Math.max(combat.bestCombo, combat.combo);
      combat.attackPerfect = true;
    }
    events.push({ tick: s.tick, type: "PERFECT", entity: v.instance });
  } else if (!combat.attackPerfect) combat.combo = 0;
  if (combat.attackArmed) {
    combat.attackArmed = false;
    combat.concentration = 0;
    combat.specials++;
    combat.specialUntil = s.tick + r.specialFxTicks!;
    events.push({ tick: s.tick, type: "SPECIAL", entity: v.instance });
  } else if (combat.specialUntil <= s.tick)
    combat.concentration = Math.min(
      100,
      combat.concentration + (ideal ? r.perfectGain! : r.normalGain!),
    );
  events.push({ tick: s.tick, type: "BOSS_HIT", entity: v.instance });
  if (c.hits >= v.profile.hits) finishBoss(s, r, "DEFEATED", events);
}
function finishBoss(
  s: SimState,
  r: Rules,
  result: "DEFEATED" | "RETREATED",
  events: SimEvent[],
) {
  const v = bossView(s, r)!,
    b = s.bosses!,
    c = b.current!;
  if (c.result) return;
  c.result = result;
  c.resultTick = s.tick;
  const bonus = result === "DEFEATED" ? v.profile.bonus : 0;
  if (result === "DEFEATED") {
    b.defeats[v.index] = (b.defeats[v.index] ?? 0) + 1;
    b.seals |= 1 << v.index;
    b.bonus = (BigInt(b.bonus) + BigInt(bonus)).toString();
  } else b.retreats[v.index] = (b.retreats[v.index] ?? 0) + 1;
  events.push({
    tick: s.tick,
    type: result === "DEFEATED" ? "BOSS_DEFEATED" : "BOSS_RETREATED",
    entity: c.instance,
    boss: {
      instance: c.instance,
      boss: c.boss,
      cycle: c.cycle,
      region: c.region,
      result,
      tick: s.tick,
      hits: c.hits,
      bonus,
    },
  });
}
/** Valid last hit wins over retreat on the same distance/tick; fatal abyss is resolved before all attacks. */
export function closeBoss(s: SimState, r: Rules, events: SimEvent[]) {
  if (!s.bosses?.current || s.bosses.current.result || s.status !== "RUNNING")
    return;
  const v = bossView(s, r)!;
  if (s.distance >= v.end) finishBoss(s, r, "RETREATED", events);
}

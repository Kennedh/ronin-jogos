import { bossRules } from "./rules.ts";
import {
  bossInitial,
  enterBoss,
  hitBoss,
  closeBoss,
  bossHazard,
} from "./bosses.ts";
import type { BossState, BossOutcome } from "./bosses.ts";
import { add, assertTick, divideStep, nextTick } from "./math.ts";
import { RULES_V1, compileRules, rulesIdentity, combatRules } from "./rules.ts";
import type { Rules } from "./rules.ts";
import { createRandom } from "./rng.ts";
import type { RandomState } from "./rng.ts";
import { supported, overlap } from "./world.ts";
import { worldAtTick } from "./actors.ts";
import { journeyAt, startOffset } from "./journey.ts";
import type { Journey, Region } from "./journey.ts";
import { directorRules } from "./rules.ts";
import type { World } from "./world.ts";
export type Action = "JUMP" | "SLIDE" | "ATTACK";
export type EndReason = "HP_ZERO" | "ABYSS" | "QUIT";
export interface CombatState {
  concentration: number;
  combo: number;
  bestCombo: number;
  specials: number;
  misses: number;
  attackHit: boolean;
  attackPerfect: boolean;
  attackArmed: boolean;
  specialUntil: number;
}
export interface SimState {
  bosses?: BossState;
  combat?: CombatState;
  journey?: Journey;
  damaged?: { id: string; end: number }[];
  rulesVersion: string;
  rulesIdentity: string;
  tick: number;
  distance: number;
  y: number;
  vy: number;
  yRemainder: number;
  xRemainder: number;
  gravityRemainder: number;
  hp: number;
  grounded: boolean;
  jumps: number;
  lastGroundedTick: number;
  jumpBufferUntil: number;
  slideBufferUntil: number;
  slideUntil: number;
  slideRecoveryUntil: number;
  attackAge: number;
  invulnerableUntil: number;
  kills: number;
  perfects: number;
  score: string;
  status: "RUNNING" | "PAUSED" | "DEAD" | "QUIT";
  endReason: EndReason | null;
  resolved: { id: string; end: number; tick?: number }[];
  rngWorld: RandomState;
  rngEnemies: RandomState;
}
export interface SimEvent {
  tick: number;
  type:
    | "JUMP"
    | "DOUBLE_JUMP"
    | "LAND"
    | "SLIDE"
    | "ATTACK"
    | "HIT"
    | "PERFECT"
    | "MISS"
    | "SPECIAL"
    | "SPECIAL_HIT"
    | "DAMAGE"
    | "DEATH"
    | "DEFLECT"
    | "REGION_ENTER"
    | "CYCLE_ENTER"
    | "BOSS_WARNING"
    | "BOSS_HIT"
    | "BOSS_DEFEATED"
    | "BOSS_RETREATED";
  boss?: BossOutcome;
  entity?: string;
  region?: Region;
  cycle?: number;
}
export function createState(
  seed: string,
  rules: Rules = RULES_V1,
  region: Region = "BAMBOO",
): SimState {
  const manifest = compileRules(rules);
  return {
    ...(bossRules(manifest) ? { bosses: bossInitial(seed) } : {}),
    ...(combatRules(manifest)
      ? {
          combat: {
            concentration: 0,
            combo: 0,
            bestCombo: 0,
            specials: 0,
            misses: 0,
            attackHit: false,
            attackPerfect: false,
            attackArmed: false,
            specialUntil: 0,
          },
        }
      : {}),
    ...(directorRules(manifest)
      ? {
          journey: journeyAt(0, startOffset(region, manifest), manifest),
          damaged: [],
        }
      : {}),
    rulesVersion: manifest.version,
    rulesIdentity: rulesIdentity(manifest),
    tick: 0,
    distance: 0,
    y: 0,
    vy: 0,
    yRemainder: 0,
    xRemainder: 0,
    gravityRemainder: 0,
    hp: 3,
    grounded: true,
    jumps: 0,
    lastGroundedTick: 0,
    jumpBufferUntil: 0,
    slideBufferUntil: 0,
    slideUntil: 0,
    slideRecoveryUntil: 0,
    attackAge: -1,
    invulnerableUntil: 0,
    kills: 0,
    perfects: 0,
    score: "0",
    status: "RUNNING",
    endReason: null,
    resolved: [],
    rngWorld: createRandom(seed, "world"),
    rngEnemies: createRandom(seed, "enemies"),
  };
}
export function control(
  state: SimState,
  action: "PAUSE" | "RESUME" | "QUIT",
): SimState {
  if (action === "PAUSE" && state.status === "RUNNING")
    return { ...state, status: "PAUSED" };
  if (action === "RESUME" && state.status === "PAUSED")
    return { ...state, status: "RUNNING" };
  if (
    action === "QUIT" &&
    (state.status === "PAUSED" || state.status === "RUNNING")
  )
    return { ...state, status: "QUIT", endReason: "QUIT" };
  throw new RangeError("invalid_control_transition");
}
export function step(
  previous: SimState,
  actions: readonly Action[],
  world: World,
  rules: Rules = RULES_V1,
): { state: SimState; events: SimEvent[] } {
  if (
    previous.rulesVersion !== rules.version ||
    previous.rulesIdentity !== rulesIdentity(rules)
  )
    throw new RangeError("rules_version_mismatch");
  if (previous.status !== "RUNNING") {
    if (actions.length) throw new RangeError("input_after_stop");
    return { state: previous, events: [] };
  }
  const r = rules;
  const tick = assertTick(previous.tick);
  nextTick(tick);
  if (
    actions.length > 2 ||
    new Set(actions).size !== actions.length ||
    actions.some((a) => !["JUMP", "SLIDE", "ATTACK"].includes(a))
  )
    throw new RangeError("invalid_actions");
  const s = {
    ...previous,
    ...(previous.bosses
      ? {
          bosses: {
            ...previous.bosses,
            current: previous.bosses.current
              ? { ...previous.bosses.current }
              : null,
            defeats: [...previous.bosses.defeats],
            retreats: [...previous.bosses.retreats],
          },
        }
      : {}),
    ...(previous.combat ? { combat: { ...previous.combat } } : {}),
    ...(previous.damaged
      ? {
          damaged: previous.damaged.filter(
            (e) =>
              e.end >=
              previous.distance - (previous.journey ? 2000000 : r.bodyWidth),
          ),
        }
      : {}),
    resolved: previous.resolved.filter(
      (e) =>
        e.end >= previous.distance - (previous.journey ? 2000000 : r.bodyWidth),
    ),
  };
  if (s.journey) world = worldAtTick(world, tick, s.resolved);
  const c = s.combat,
    cr = combatRules(r);
  const events: SimEvent[] = [];
  const event = (type: SimEvent["type"], entity?: string) =>
    events.push(entity === undefined ? { tick, type } : { tick, type, entity });
  if (c && s.attackAge === r.attackWindup + r.attackActive && !c.attackHit) {
    c.combo = 0;
    c.misses = add(c.misses, 1);
    event("MISS");
  }
  if (s.attackAge >= r.attackWindup + r.attackActive + r.attackRecovery)
    s.attackAge = -1;
  if (s.grounded) {
    s.lastGroundedTick = tick;
    s.jumps = 0;
  }
  if (actions.includes("JUMP"))
    s.jumpBufferUntil = add(tick, r.jumpBufferTicks);
  if (actions.includes("SLIDE"))
    s.slideBufferUntil = add(tick, r.jumpBufferTicks);
  let sliding = tick < s.slideUntil;
  if (!sliding && tick < s.jumpBufferUntil && s.jumps < 2) {
    const first =
      s.grounded ||
      (s.jumps === 0 && tick - s.lastGroundedTick < r.coyoteTicks);
    s.vy = first ? r.jump : r.doubleJump;
    s.jumps = first ? 1 : 2;
    s.grounded = false;
    s.yRemainder = 0;
    s.gravityRemainder = 0;
    s.jumpBufferUntil = 0;
    event(first ? "JUMP" : "DOUBLE_JUMP");
  }
  if (
    !sliding &&
    s.grounded &&
    tick < s.slideBufferUntil &&
    tick >= s.slideRecoveryUntil &&
    s.attackAge < 0
  ) {
    s.slideUntil = add(tick, r.slideTicks);
    s.slideRecoveryUntil = add(s.slideUntil, r.slideRecoveryTicks);
    s.slideBufferUntil = 0;
    sliding = true;
    event("SLIDE");
  }
  if (actions.includes("ATTACK") && !sliding && s.attackAge < 0) {
    s.attackAge = 0;
    if (c && cr) {
      c.attackHit = false;
      c.attackPerfect = false;
      c.attackArmed = c.concentration === cr.concentrationCap;
    }
    event("ATTACK");
  }
  const [dx, xrem] = divideStep(s.journey?.speed ?? r.speed, s.xRemainder);
  s.distance = add(s.distance, dx);
  s.xRemainder = xrem;
  const oldY = s.y;
  if (!s.grounded || !supported(world, s.distance)) {
    s.grounded = false;
    const [dv, grem] = divideStep(r.gravity, s.gravityRemainder);
    s.gravityRemainder = grem;
    s.vy = add(s.vy, dv);
    const [dy, yrem] = divideStep(s.vy, s.yRemainder);
    s.y = add(s.y, dy);
    s.yRemainder = yrem;
    if (oldY <= 0 && s.y >= 0 && s.vy >= 0 && supported(world, s.distance)) {
      s.y = 0;
      s.vy = 0;
      s.yRemainder = 0;
      s.gravityRemainder = 0;
      s.grounded = true;
      s.jumps = 0;
      s.lastGroundedTick = tick;
      event("LAND");
      if (tick < s.jumpBufferUntil && tick >= s.slideUntil) {
        s.vy = r.jump;
        s.jumps = 1;
        s.grounded = false;
        s.jumpBufferUntil = 0;
        event("JUMP");
      }
    }
  }
  if (!sliding && s.grounded) {
    const stand = {
      left: s.distance - r.bodyWidth / 2,
      right: add(s.distance, r.bodyWidth / 2),
      top: s.y - r.bodyHeight,
      bottom: s.y,
    };
    const low = { ...stand, top: s.y - r.slideHeight };
    if (
      previous.slideUntil === tick &&
      world.entities.some(
        (e) =>
          e.kind === "OBSTACLE" &&
          overlap(stand, {
            left: e.x,
            right: add(e.x, e.width),
            top: e.top,
            bottom: e.bottom,
          }) &&
          !overlap(low, {
            left: e.x,
            right: add(e.x, e.width),
            top: e.top,
            bottom: e.bottom,
          }),
      )
    ) {
      sliding = true;
      s.slideUntil = add(tick, 1);
      s.slideRecoveryUntil = add(s.slideUntil, r.slideRecoveryTicks);
    }
  }
  const width = sliding ? r.slideWidth : r.bodyWidth,
    height = sliding ? r.slideHeight : r.bodyHeight;
  const body = {
    left: s.distance - width / 2,
    right: add(s.distance, width / 2),
    top: s.y - height,
    bottom: s.y,
  };
  // Falling below the recoverable ledge line wins over all damage/attack awards.
  if (s.y >= r.fatalY) {
    s.hp = 0;
    s.status = "DEAD";
    s.endReason = "ABYSS";
    event("DEATH");
  }
  if (s.status === "RUNNING") {
    enterBoss(s, r, events);
    const hazard = bossHazard(s, r);
    if (hazard) world = { ...world, entities: [...world.entities, hazard] };
    const sword = {
      left: body.right,
      right: add(body.right, r.swordReach),
      top: s.y - r.bodyHeight,
      bottom: s.y,
    };
    if (
      s.attackAge >= r.attackWindup &&
      s.attackAge < r.attackWindup + r.attackActive
    ) {
      hitBoss(s, r, sword, events);
      for (const e of world.entities) {
        if (
          (e.kind !== "ENEMY" && !(s.journey && e.kind === "PROJECTILE")) ||
          s.resolved.some((v) => v.id === e.id) ||
          (c &&
            e.vulnerability &&
            (tick < e.vulnerability.start || tick >= e.vulnerability.end))
        )
          continue;
        if (
          overlap(sword, {
            left: e.x,
            right: add(e.x, e.width),
            top: e.top,
            bottom: e.bottom,
          })
        ) {
          s.resolved.push({
            id: e.id,
            end: add(e.x, e.width),
            ...(s.journey ? { tick } : {}),
          });
          if (e.kind === "PROJECTILE") {
            event("DEFLECT", e.id);
            continue;
          }
          s.kills = add(s.kills, 1);
          event("HIT", e.id);
          const perfect =
            e.idealTick !== undefined &&
            Math.abs(tick - e.idealTick) <= r.perfectTicks;
          if (c && cr) {
            if (perfect && !c.attackPerfect) {
              c.combo = add(c.combo, 1);
              c.bestCombo = Math.max(c.bestCombo, c.combo);
              c.attackPerfect = true;
            } else if (!perfect && !c.attackHit && cr.normalBreaksCombo)
              c.combo = 0;
            c.attackHit = true;
            if (c.attackArmed) {
              c.attackArmed = false;
              c.concentration = 0;
              c.specials = add(c.specials, 1);
              c.specialUntil = add(tick, cr.specialFxTicks);
              event("SPECIAL", e.id);
              const area = {
                ...sword,
                right: add(body.right, cr.specialReach),
              };
              for (const extra of world.entities) {
                if (
                  extra.kind !== "ENEMY" ||
                  extra.specialEligible === false ||
                  s.resolved.some((v) => v.id === extra.id) ||
                  (extra.vulnerability &&
                    (tick < extra.vulnerability.start ||
                      tick >= extra.vulnerability.end))
                )
                  continue;
                if (
                  !overlap(area, {
                    left: extra.x,
                    right: add(extra.x, extra.width),
                    top: extra.top,
                    bottom: extra.bottom,
                  })
                )
                  continue;
                s.resolved.push({
                  id: extra.id,
                  end: add(extra.x, extra.width),
                  ...(s.journey ? { tick } : {}),
                });
                s.kills = add(s.kills, 1);
                event("SPECIAL_HIT", extra.id);
              }
            } else if (c.specialUntil <= tick)
              c.concentration = Math.min(
                cr.concentrationCap,
                c.concentration + (perfect ? cr.perfectGain : cr.normalGain),
              );
          }
          if (perfect) {
            s.perfects = add(s.perfects, 1);
            event("PERFECT", e.id);
          }
        }
      }
    }
    if (tick >= s.invulnerableUntil) {
      const hit = world.entities.find(
        (e) =>
          e.hazard !== false &&
          !s.resolved.some((v) => v.id === (e.damageOwner ?? e.id)) &&
          !s.damaged?.some((v) => v.id === (e.damageOwner ?? e.id)) &&
          overlap(body, {
            left: e.x,
            right: add(e.x, e.width),
            top: e.top,
            bottom: e.bottom,
          }),
      );
      if (hit) {
        s.hp -= 1;
        s.invulnerableUntil = add(tick, r.hurtTicks);
        event("DAMAGE", hit.damageOwner ?? hit.id);
        s.damaged?.push({
          id: hit.damageOwner ?? hit.id,
          end: add(hit.x, hit.width + 200000),
        });
        if (s.hp === 0) {
          s.status = "DEAD";
          s.endReason = "HP_ZERO";
          event("DEATH");
        }
      }
    }
  }
  closeBoss(s, r, events);
  if (s.journey) {
    const next = journeyAt(s.distance, s.journey.worldOffset, r);
    if (next.cycle !== s.journey.cycle)
      events.push({ tick, type: "CYCLE_ENTER", cycle: next.cycle });
    if (next.region !== s.journey.region || next.cycle !== s.journey.cycle)
      events.push({
        tick,
        type: "REGION_ENTER",
        region: next.region,
        cycle: next.cycle,
      });
    s.journey = next;
  }
  s.score = (
    (BigInt(s.distance) / BigInt(r.scale * r.unitsPerMeter)) * 10n +
    BigInt(s.kills) * 30n +
    BigInt(s.perfects) * 100n +
    BigInt(s.bosses?.bonus ?? "0")
  ).toString();
  if (s.attackAge >= 0) s.attackAge += 1;
  s.tick = nextTick(tick);
  return { state: s, events };
}

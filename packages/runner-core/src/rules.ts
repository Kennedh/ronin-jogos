export const RULES_V1 = Object.freeze({
  version: "rr-physics-0.1.0",
  tickRate: 60,
  scale: 1000,
  unitsPerMeter: 40,
  speed: 360000,
  speedCeiling: 600000,
  gravity: 2100000,
  jump: -750000,
  doubleJump: -670000,
  coyoteTicks: 5,
  jumpBufferTicks: 6,
  slideTicks: 33,
  slideRecoveryTicks: 6,
  attackWindup: 4,
  attackActive: 7,
  attackRecovery: 11,
  perfectTicks: 6,
  hurtTicks: 54,
  bodyWidth: 44000,
  bodyHeight: 88000,
  slideWidth: 54000,
  slideHeight: 44000,
  swordReach: 140000,
  fatalY: 120000,
} as const);
/** Development combat major; v1 remains executable with its exact state shape. */
export const RULES_V2 = Object.freeze({
  ...RULES_V1,
  version: "rr-physics-0.2.0",
  concentrationCap: 100,
  perfectGain: 12,
  normalGain: 3,
  normalBreaksCombo: 1,
  specialReach: 220000,
  specialFxTicks: 12,
});
export interface CombatRules {
  readonly concentrationCap: number;
  readonly perfectGain: number;
  readonly normalGain: number;
  readonly normalBreaksCombo: number;
  readonly specialReach: number;
  readonly specialFxTicks: number;
}
export function combatRules(rules: Rules): CombatRules | undefined {
  return rules.version === RULES_V2.version
    ? (rules as Rules & CombatRules)
    : undefined;
}
export type Rules = {
  readonly [K in keyof typeof RULES_V1]: K extends "version" ? string : number;
} & Partial<CombatRules>;
export function compileRules(input: Rules): Rules {
  if (
    typeof input.version !== "string" ||
    !/^[a-zA-Z0-9._-]{1,100}$/.test(input.version) ||
    Object.keys(input).sort().join(",") !==
      Object.keys(input.version === RULES_V2.version ? RULES_V2 : RULES_V1)
        .sort()
        .join(",")
  )
    throw new RangeError("invalid_rules");
  for (const [key, value] of Object.entries(input))
    if (
      key !== "version" &&
      (!Number.isSafeInteger(value) ||
        (value === 0 && key !== "normalBreaksCombo"))
    )
      throw new RangeError("invalid_rules");
  if (
    !input.version ||
    input.tickRate !== 60 ||
    input.scale <= 0 ||
    input.unitsPerMeter <= 0 ||
    !Number.isSafeInteger(input.scale * input.unitsPerMeter) ||
    input.speed <= 0 ||
    input.speed > input.speedCeiling ||
    input.jump >= 0 ||
    input.doubleJump >= 0 ||
    input.gravity <= 0 ||
    input.bodyWidth % 2 !== 0 ||
    input.slideWidth % 2 !== 0
  )
    throw new RangeError("invalid_rules");
  for (const key of [
    "coyoteTicks",
    "jumpBufferTicks",
    "slideTicks",
    "slideRecoveryTicks",
    "attackWindup",
    "attackActive",
    "attackRecovery",
    "perfectTicks",
    "hurtTicks",
    "bodyWidth",
    "bodyHeight",
    "slideWidth",
    "slideHeight",
    "swordReach",
    "fatalY",
  ] as const)
    if (input[key] <= 0) throw new RangeError("invalid_rules");
  const combat = combatRules(input);
  if (
    combat &&
    (combat.concentrationCap !== 100 ||
      combat.perfectGain < 1 ||
      combat.perfectGain > 100 ||
      combat.normalGain < 1 ||
      combat.normalGain > 100 ||
      ![0, 1].includes(combat.normalBreaksCombo) ||
      combat.specialReach < input.swordReach ||
      combat.specialReach > 1000000 ||
      combat.specialFxTicks < 1 ||
      combat.specialFxTicks > 60)
  )
    throw new RangeError("invalid_combat_rules");
  return Object.freeze({ ...input });
}
export const TICK_RATE = RULES_V1.tickRate;

const identities = new WeakMap<Rules, string>();
/** Collision-free descriptor, not a secret/hash; immutable registry manifests only. */
export function rulesIdentity(rules: Rules): string {
  if (!Object.isFrozen(rules)) throw new RangeError("uncompiled_rules");
  let identity = identities.get(rules);
  if (identity === undefined) {
    identity = JSON.stringify(
      Object.entries(rules).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
    identities.set(rules, identity);
  }
  return identity;
}

/** Competitive clock uses safe integers, never graphics frame time. */
export const TICK_RATE = 60;
export type EndReason = "HP_ZERO" | "ABYSS" | "QUIT";
export function assertTick(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError("invalid_tick");
  return value;
}
export function nextTick(tick: number): number {
  return assertTick(assertTick(tick) + 1);
}
/** Full step/physics is implemented in 1B. No renderer or clock dependency here. */

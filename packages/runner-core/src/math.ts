export function integer(n: number): number {
  if (!Number.isSafeInteger(n)) throw new RangeError("unsafe_integer");
  return n;
}
export function add(a: number, b: number): number {
  return integer(integer(a) + integer(b));
}
export function divideStep(rate: number, remainder: number): [number, number] {
  integer(remainder);
  if (Math.abs(remainder) >= 60) throw new RangeError("invalid_remainder");
  const total = BigInt(add(rate, remainder));
  return [Number(total / 60n), Number(total % 60n)];
}
export function assertTick(value: number): number {
  if (integer(value) < 0) throw new RangeError("invalid_tick");
  return value;
}
export function nextTick(tick: number): number {
  return assertTick(add(assertTick(tick), 1));
}

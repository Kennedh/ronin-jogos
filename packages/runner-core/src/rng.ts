export type RandomState = readonly [number, number, number, number];
export type RandomStream = "world" | "enemies" | "cosmetic";
function rotl(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}
/** xoshiro128** v1; uint32 only inside the PRNG, never for distance. */
export function randomNext(state: RandomState): {
  value: number;
  state: RandomState;
} {
  if (
    state.some((n) => !Number.isInteger(n) || n < 0 || n > 0xffffffff) ||
    state.every((n) => n === 0)
  )
    throw new RangeError("invalid_rng");
  let [a, b, c, d] = state;
  const value = Math.imul(rotl(Math.imul(b, 5), 7), 9) >>> 0;
  const t = b << 9;
  c ^= a;
  d ^= b;
  b ^= c;
  a ^= d;
  c ^= t;
  d = rotl(d, 11);
  return { value, state: [a >>> 0, b >>> 0, c >>> 0, d >>> 0] };
}
export function createRandom(seed: string, stream: RandomStream): RandomState {
  if (
    !/^[a-f0-9]{32}$/.test(seed) ||
    !["world", "enemies", "cosmetic"].includes(stream)
  )
    throw new RangeError("invalid_seed");
  let tag = 2166136261;
  for (const ch of `rr-xoshiro128ss-v1:${stream}`)
    tag = Math.imul(tag ^ ch.charCodeAt(0), 16777619) >>> 0;
  const words = [0, 1, 2, 3].map(
    (i) =>
      (parseInt(seed.slice(i * 8, i * 8 + 8), 16) ^ Math.imul(tag, i + 1)) >>>
      0,
  );
  if (words.every((n) => n === 0)) return [1, 0, 0, 0];
  return words as unknown as RandomState;
}

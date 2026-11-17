export interface VerifierBudget {
  concurrency: number;
  ticksPerBatch: number;
}
export function verifierBudget(
  concurrency: number,
  ticksPerBatch: number,
): VerifierBudget {
  if (
    !Number.isSafeInteger(concurrency) ||
    concurrency < 1 ||
    concurrency > 8 ||
    !Number.isSafeInteger(ticksPerBatch) ||
    ticksPerBatch < 1 ||
    ticksPerBatch > 3600
  ) {
    throw new RangeError("invalid_verifier_budget");
  }
  return { concurrency, ticksPerBatch };
}
// Budget configuration is not a running verifier. DB claims/replay arrive in 1C.

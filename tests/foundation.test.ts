import { test } from "node:test";
import assert from "node:assert/strict";
import { runnerPath, preferredLocale } from "@ronin/content";
import { assertTick, nextTick } from "@ronin/runner-core";
import { verifierBudget } from "../apps/verifier/src/index.ts";
test("confirmed game path stays under /roninrunner in both languages", () => {
  assert.equal(runnerPath(), "/roninrunner");
  assert.equal(runnerPath("pt-BR"), "/roninrunner/pt-br");
  assert.equal(runnerPath("en"), "/roninrunner/en");
  assert.equal(preferredLocale(["pt-PT", "en"]), "pt-BR");
  assert.equal(preferredLocale(["es", "pt-BR"]), "en");
  assert.equal(preferredLocale([]), "en");
});
test("competitive tick never wraps 32 bits or silently loses precision", () => {
  assert.equal(nextTick(2 ** 32), 2 ** 32 + 1);
  for (const tick of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => assertTick(tick));
  assert.throws(() => nextTick(Number.MAX_SAFE_INTEGER));
});
test("verification work has finite configurable budgets", () => {
  assert.deepEqual(verifierBudget(1, 3600), {
    concurrency: 1,
    ticksPerBatch: 3600,
  });
  for (const [count, ticks] of [
    [0, 1],
    [1, 0],
    [Infinity, 1],
    [1, 3601],
    [1.5, 1],
  ])
    assert.throws(() => verifierBudget(count!, ticks!));
});

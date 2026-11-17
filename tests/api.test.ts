import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi } from "../apps/api/src/index.ts";
import { validate } from "@ronin/contracts";
test("real Fastify liveness matches the generated contract, without claiming DB readiness", async () => {
  const app = createApi();
  try {
    const response = await app.inject({ url: "/api/v1/health" });
    assert.equal(response.statusCode, 200);
    assert.equal(validate("Health", response.json()), true);
    const run = await app.inject({
      method: "POST",
      url: "/api/v1/runs/start",
      payload: { mode: "FULL" },
    });
    assert.equal(run.statusCode, 404); // Liveness-only mode cannot issue a run without a configured DB.
  } finally {
    await app.close();
  }
});

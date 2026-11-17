import { setTimeout as delay } from "node:timers/promises";
import { developmentPool } from "../../../scripts/development.ts";
import { VerificationQueue } from "@ronin/data";
import { verifierBudget, runOnce } from "./index.ts";
const pool = developmentPool(),
  queue = new VerificationQueue(pool),
  controller = new AbortController();
const budget = verifierBudget(
  Number(process.env["VERIFIER_CONCURRENCY"] ?? 1),
  Number(process.env["VERIFIER_TICKS_PER_BATCH"] ?? 3600),
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => controller.abort());
try {
  await pool.query("SELECT generation FROM run_verification_jobs LIMIT 0");
  if (process.argv.includes("--once"))
    console.log(
      await runOnce(queue, {
        signal: controller.signal,
        ticksPerBatch: budget.ticksPerBatch,
      }),
    );
  else
    await Promise.all(
      Array.from({ length: budget.concurrency }, async () => {
        while (!controller.signal.aborted) {
          try {
            const result = await runOnce(queue, {
              signal: controller.signal,
              ticksPerBatch: budget.ticksPerBatch,
            });
            if (result === "IDLE")
              await delay(250, undefined, { signal: controller.signal });
          } catch {
            if (!controller.signal.aborted) {
              console.error("verifier_database_unavailable");
              await delay(1000, undefined, { signal: controller.signal }).catch(
                () => {},
              );
            }
          }
        }
      }),
    );
} finally {
  await pool.end();
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { parityScenario } from "../fixtures/parity-scenario.ts";
import { FixedClock } from "@ronin/runner-client";

test(
  "RR-CORE-004/005: real Chromium and Node match every competitive state at30/60/120FPS",
  { timeout: 60000 },
  async () => {
    const server = await createServer({
      root: process.cwd(),
      logLevel: "silent",
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === "string")
      throw new Error("missing_parity_port");
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
    const browser = await chromium.launch(
      existsSync(chrome) ? { executablePath: chrome } : {},
    );
    try {
      const page = await browser.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        `http://127.0.0.1:${address.port}/tests/fixtures/parity.html`,
      );
      await page.waitForFunction(
        () =>
          typeof (window as unknown as { parityScenario: unknown })
            .parityScenario === "function",
      );
      const expected = await parityScenario(60);
      assert.equal(expected.updates, 600);
      for (const fps of [30, 60, 120]) {
        const actual = await page.evaluate(async (fps) => {
          const fn = (
            window as unknown as {
              parityScenario: (fps: number) => Promise<unknown>;
            }
          ).parityScenario;
          return await fn(fps);
        }, fps);
        assert.deepEqual(actual, expected);
        assert.deepEqual(await parityScenario(fps), expected);
      }
      assert.deepEqual(errors, []);
      console.log(
        "Parity browser",
        browser.version(),
        "trace",
        expected.traceHash,
      );
    } finally {
      await browser.close();
      await server.close();
    }
  },
);
test("fixed clock preserves fractional frame time and rejects overflow without truncating ticks", () => {
  const clock = new FixedClock();
  let count = 0;
  clock.advance(16666, () => count++);
  assert.equal(count, 0);
  clock.advance(1, () => count++);
  assert.equal(count, 1);
  assert.throws(() => clock.advance(-1, () => {}));
  assert.throws(() => clock.advance(Number.MAX_SAFE_INTEGER, () => {}));
});

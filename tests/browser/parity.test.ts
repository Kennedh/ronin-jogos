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

test(
  "2: combat special, streak and concentration match every tick in Chromium/Node at 30/60/120",
  { timeout: 60000 },
  async () => {
    const { combatScenario } = await import("../fixtures/combat-scenario.ts");
    const server = await createServer({
      root: process.cwd(),
      logLevel: "silent",
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const address = server.httpServer!.address();
    if (!address || typeof address === "string") throw new Error("no_port");
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe",
      browser = await chromium.launch(
        existsSync(chrome) ? { executablePath: chrome } : {},
      );
    try {
      const page = await browser.newPage();
      await page.goto(
        `http://127.0.0.1:${address.port}/tests/fixtures/parity.html`,
      );
      await page.waitForFunction(
        () =>
          typeof (window as unknown as { combatScenario: unknown })
            .combatScenario === "function",
      );
      const expected = await combatScenario(60);
      assert.equal(expected.updates, 600);
      assert.ok(expected.state.combat!.specials >= 1);
      assert.ok(expected.state.combat!.bestCombo >= 9);
      for (const fps of [30, 60, 120]) {
        const result = await page.evaluate(
          async (fps) =>
            await (
              window as unknown as {
                combatScenario: (fps: number) => Promise<unknown>;
              }
            ).combatScenario(fps),
          fps,
        );
        assert.deepEqual(result, expected);
        assert.deepEqual(await combatScenario(fps), expected);
      }
      console.log("Combat parity", browser.version(), expected.traceHash);
    } finally {
      await browser.close();
      await server.close();
    }
  },
);

test(
  "3: director clock/regions, moving attacks/projectiles and survival replay match Chromium/Node",
  { timeout: 60000 },
  async () => {
    const { directorScenario } =
      await import("../fixtures/director-scenario.ts");
    const server = await createServer({
      root: process.cwd(),
      logLevel: "silent",
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const address = server.httpServer!.address();
    if (!address || typeof address === "string") throw new Error("no_port");
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe",
      browser = await chromium.launch(
        existsSync(chrome) ? { executablePath: chrome } : {},
      );
    try {
      const page = await browser.newPage();
      await page.goto(
        `http://127.0.0.1:${address.port}/tests/fixtures/parity.html`,
      );
      await page.waitForFunction(
        () =>
          typeof (window as unknown as { directorScenario: unknown })
            .directorScenario === "function",
      );
      const expected = await directorScenario(60);
      assert.equal(expected.updates, 3600);
      assert.equal(expected.state.hp, 3);
      assert.ok(expected.state.journey!.cycle >= 2);
      for (const fps of [30, 60, 120]) {
        const result = await page.evaluate(
          async (fps) =>
            await (
              window as unknown as {
                directorScenario: (fps: number) => Promise<unknown>;
              }
            ).directorScenario(fps),
          fps,
        );
        assert.deepEqual(result, expected);
        assert.deepEqual(await directorScenario(fps), expected);
      }
      console.log("Director parity", browser.version(), expected.traceHash);
    } finally {
      await browser.close();
      await server.close();
    }
  },
);

test(
  "4: guardian hits/retreats/score match every tick in Chromium and Node",
  { timeout: 60000 },
  async () => {
    const { bossScenario } = await import("../fixtures/boss-scenario.ts");
    const server = await createServer({
      root: process.cwd(),
      logLevel: "silent",
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const address = server.httpServer!.address();
    if (!address || typeof address === "string") throw new Error("no_port");
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe",
      browser = await chromium.launch(
        existsSync(chrome) ? { executablePath: chrome } : {},
      );
    try {
      const page = await browser.newPage();
      await page.goto(
        `http://127.0.0.1:${address.port}/tests/fixtures/parity.html`,
      );
      await page.waitForFunction(
        () =>
          typeof (window as unknown as { bossScenario: unknown })
            .bossScenario === "function",
      );
      const expected = await bossScenario(60);
      assert.ok(expected.updates > 10000);
      assert.equal(expected.victories, 4);
      assert.equal(expected.retreats, 4);
      assert.equal(
        expected.traceHash,
        "4dfdb4e8456c45c527e04d51a9576212ed66947311131e689ef6f6c67c8042b8",
      );
      for (const fps of [30, 60, 120]) {
        const result = await page.evaluate(
          async (fps) =>
            await (
              window as unknown as {
                bossScenario: (fps: number) => Promise<unknown>;
              }
            ).bossScenario(fps),
          fps,
        );
        assert.deepEqual(result, expected);
        assert.deepEqual(await bossScenario(fps), expected);
      }
      console.log("Boss parity", browser.version(), expected.traceHash);
    } finally {
      await browser.close();
      await server.close();
    }
  },
);

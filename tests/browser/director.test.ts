import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";
import { portalFixture } from "../helpers/portal.ts";
import { DIRECTOR_MANIFEST } from "@ronin/content/runner-manifest";
import { REGIONS } from "@ronin/runner-core";
test(
  "3: real regional runs, localized biomes, score origin and authorized starts",
  { timeout: 120000 },
  async (t) => {
    const fixture = await portalFixture(DIRECTOR_MANIFEST),
      chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe",
      browser = await chromium.launch(
        existsSync(chrome) ? { executablePath: chrome } : {},
      );
    await mkdir("artifacts/phase-3", { recursive: true });
    try {
      await t.test(
        "new visitor sees locked regions and server refuses a forged start",
        async () => {
          await fixture.reset();
          const context = await browser.newContext(),
            page = await context.newPage();
          try {
            await page.goto(fixture.origin + "/roninrunner/pt-br");
            await expect(page.locator("#play")).toBeEnabled();
            await page.locator("#mode").selectOption("REGIONAL");
            await expect(page.locator("#region")).toBeVisible();
            await expect(
              page.locator('#region option[value="TEMPLE"]'),
            ).toBeDisabled();
            const denied = await page.evaluate(async () => {
              const guest = await fetch("/api/v1/auth/guest", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: "{}",
              });
              const csrf = guest.headers.get("x-csrf-token")!;
              return (
                await fetch("/api/v1/runs/start", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    "x-csrf-token": csrf,
                    "idempotency-key": crypto.randomUUID(),
                  },
                  body: JSON.stringify({
                    mode: "REGIONAL",
                    region_id: "TEMPLE",
                  }),
                })
              ).status;
            });
            assert.equal(denied, 403);
          } finally {
            await context.close();
          }
        },
      );
      const pictures = new Set<string>();
      for (const region of REGIONS)
        await t.test(
          `${region}: authentic regional run starts at zero and verifies`,
          async () => {
            await fixture.reset();
            const mobile = region === "CASTLE",
              context = await browser.newContext({
                viewport: mobile
                  ? { width: 844, height: 390 }
                  : { width: 1280, height: 900 },
                hasTouch: mobile,
                isMobile: mobile,
                locale: region === "BAMBOO" ? "pt-BR" : "en",
              }),
              page = await context.newPage(),
              errors: string[] = [];
            page.on("pageerror", (e) => errors.push(e.message));
            await page.addInitScript(() => {
              (window as unknown as { qaCsp: string[] }).qaCsp = [];
              document.addEventListener("securitypolicyviolation", (e) =>
                (window as unknown as { qaCsp: string[] }).qaCsp.push(
                  e.violatedDirective,
                ),
              );
            });
            try {
              const response = await context.request.post(
                fixture.origin + "/api/v1/auth/guest",
                { headers: { Origin: fixture.origin }, data: {} },
              );
              assert.equal(response.status(), 201);
              const player = (await response.json()).player_id;
              // Synthetic QA fixture only. Public users cannot grant their own unlocks.
              for (const unlocked of REGIONS)
                await fixture.db.pool.query(
                  "INSERT INTO player_regions(player_id,region_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
                  [player, unlocked],
                );
              await page.goto(
                fixture.origin +
                  (region === "BAMBOO"
                    ? "/roninrunner/pt-br"
                    : "/roninrunner/en"),
              );
              await expect(page.locator("#play")).toBeEnabled();
              await page.locator("#fullscreen").uncheck();
              await page.locator("#mode").selectOption("REGIONAL");
              await expect(
                page.locator(`#region option[value="${region}"]`),
              ).toBeEnabled();
              await page.locator("#region").selectOption(region);
              const start = page.waitForResponse((r) =>
                r.url().endsWith("/runs/start"),
              );
              await page.locator("#play").click();
              const ticket = await (await start).json();
              assert.equal(ticket.starting_region_id, region);
              assert.equal(ticket.versions.rules_major, 3);
              await expect(page.locator("#surface")).toHaveAttribute(
                "data-region",
                region,
              );
              await expect(page.locator("#surface")).toHaveAttribute(
                "data-cycle",
                "1",
              );
              await page.waitForFunction(
                () =>
                  Number(
                    document.querySelector<HTMLElement>("#surface")?.dataset[
                      "tick"
                    ],
                  ) >= 65,
              );
              assert.equal(
                await page.evaluate(
                  () => document.documentElement.scrollWidth > innerWidth,
                ),
                false,
              );
              const pixels = await page
                .locator("#surface canvas")
                .evaluate((c) => (c as HTMLCanvasElement).toDataURL());
              pictures.add(pixels);
              await page.screenshot({
                path: `artifacts/phase-3/region-${region.toLowerCase()}.png`,
                fullPage: true,
              });
              await page.locator("#pause").click();
              await page.locator("#quit").click();
              await page.locator("#confirm-quit").click();
              await expect(page.locator("#result")).toHaveAttribute(
                "data-status",
                "VERIFIED",
                { timeout: 15000 },
              );
              const row = (
                await fixture.db.pool.query(
                  "SELECT real_distance,score,state_hash FROM run_outcomes WHERE run_id=$1",
                  [ticket.run_id],
                )
              ).rows[0];
              assert.ok(Number(row.real_distance) < 2000000);
              assert.ok(Number(row.score) < 1000);
              await expect(page.locator("#surface")).toHaveAttribute(
                "data-state-hash",
                row.state_hash,
              );
              assert.deepEqual(errors, []);
              assert.deepEqual(
                await page.evaluate(
                  () => (window as unknown as { qaCsp: string[] }).qaCsp,
                ),
                [],
              );
              assert.deepEqual(fixture.failures, []);
            } finally {
              await context.close();
            }
          },
        );
      assert.equal(pictures.size, 4);
    } finally {
      await browser.close();
      await fixture.close();
    }
  },
);
test(
  "3: larger void and maximum-corruption layers render from a reachable core witness",
  { timeout: 60000 },
  async () => {
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
      const page = await browser.newPage({
        viewport: { width: 1280, height: 780 },
      });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        `http://127.0.0.1:${address.port}/tests/fixtures/world-preview.html`,
      );
      await page.waitForFunction(
        () =>
          typeof (window as unknown as { previewWorld: unknown })
            .previewWorld === "function",
      );
      for (const [region, cycle] of [
        ["BAMBOO", 1],
        ["CASTLE", 4],
      ] as const) {
        const data = await page.evaluate(
          async (args) =>
            await (
              window as unknown as {
                previewWorld: (
                  region: "BAMBOO" | "CASTLE",
                  cycle: number,
                ) => Promise<{
                  gapWidth: number;
                  gapX: number;
                  stateHash: string;
                  hp: number;
                }>;
              }
            ).previewWorld(args[0], args[1]),
          [region, cycle] as const,
        );
        assert.ok(data.gapWidth >= 180);
        assert.equal(data.hp, 3);
        await expect(page.locator("#stage canvas")).toHaveCount(1);
        await expect(page.locator("#stage")).toHaveAttribute(
          "data-cycle",
          String(cycle),
        );
        await expect
          .poll(
            async () =>
              await page
                .locator("canvas")
                .evaluate(
                  (c, { gapX, gapWidth }) =>
                    Array.from(
                      (c as HTMLCanvasElement)
                        .getContext("2d")!
                        .getImageData(
                          Math.floor(gapX + gapWidth / 2),
                          705,
                          1,
                          1,
                        ).data,
                    ),
                  data,
                ),
          )
          .toEqual([39, 45, 39, 255]);
        await page.screenshot({
          path: `artifacts/phase-3/void-${region.toLowerCase()}-${cycle}.png`,
          fullPage: true,
        });
      }
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
      await server.close();
    }
  },
);

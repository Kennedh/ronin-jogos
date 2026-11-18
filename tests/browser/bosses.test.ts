import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { portalFixture } from "../helpers/portal.ts";
import { BOSS_MANIFEST } from "@ronin/content/runner-manifest";
import { RULES_V4 } from "@ronin/runner-core";
import { createServer } from "vite";
import { bossRun } from "../fixtures/boss-run.ts";
test(
  "4: built PT/EN guardian HUD, ordinary keyboard replay and server-confirmed seal",
  { timeout: 360000 },
  async (t) => {
    let now = Date.now();
    const fixture = await portalFixture(BOSS_MANIFEST, () => new Date(now));
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe",
      browser = await chromium.launch(
        existsSync(chrome) ? { executablePath: chrome } : {},
      );
    await mkdir("artifacts/phase-4", { recursive: true });
    try {
      for (const language of ["pt-br", "en"]) {
        await t.test(language, async () => {
          await fixture.reset();
          const context = await browser.newContext({
              viewport:
                language === "en"
                  ? { width: 844, height: 390 }
                  : { width: 1280, height: 960 },
              hasTouch: language === "en",
              isMobile: language === "en",
            }),
            page = await context.newPage(),
            errors: string[] = [];
          page.on("pageerror", (e) => errors.push(e.message));
          await page.addInitScript(() =>
            document.addEventListener("securitypolicyviolation", (e) => {
              document.documentElement.dataset["qaCsp"] = e.violatedDirective;
            }),
          );
          try {
            await page.goto(fixture.origin + "/roninrunner/" + language);
            await expect(page.locator("#play")).toBeEnabled();
            await page.locator("#fullscreen").uncheck();
            await page.locator("#boss-sound").uncheck();
            const virtual = language === "en";
            if (virtual) {
              await page.clock.install();
              await page.clock.pauseAt(new Date(Date.now() + 1000));
            }
            await page.locator("#play").click();
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "running",
            );
            const id = await page
                .locator("#surface")
                .getAttribute("data-run-id"),
              ticket = (
                await fixture.db.pool.query(
                  "SELECT seed,started_at FROM runs WHERE id=$1",
                  [id],
                )
              ).rows[0];
            const witness = bossRun(ticket.seed, RULES_V4, 58000000);
            now =
              new Date(ticket.started_at).getTime() +
              Math.ceil((witness.state.tick / 60) * 1000) +
              5000;
            if (virtual) await page.clock.runFor(34);
            const tick = async () =>
              Number(await page.locator("#surface").getAttribute("data-tick"));
            async function until(target: number) {
              if (!virtual) {
                await page.waitForFunction(
                  (t) =>
                    Number(
                      document.getElementById("surface")!.dataset["tick"],
                    ) >= Math.max(0, t - 1),
                  target,
                  { polling: "raf", timeout: 90000 },
                );
                return;
              }
              while ((await tick()) < target) {
                const left = target - (await tick());
                await page.clock.runFor(
                  Math.max(17, Math.min(5000, ((left - 1) * 1000) / 60)),
                );
              }
            }
            let captured = false;
            for (const [commandIndex, c] of witness.commands.entries()) {
              await until(c.tick);
              await page.keyboard.press(
                c.action === "JUMP"
                  ? "Space"
                  : c.action === "SLIDE"
                    ? "KeyS"
                    : "KeyJ",
              );
              if (
                !captured &&
                (witness.commands[commandIndex + 1]?.tick ?? Infinity) -
                  c.tick >
                  20 &&
                (await page.locator("#surface").getAttribute("data-boss")) ===
                  "B01"
              ) {
                // Consume the queued action, then inspect in a safe input gap.
                // Real screenshot latency must not skip later witness commands.
                await until(c.tick + 2);
                await page.locator("#pause").click();
                await expect(page.locator("#surface")).toHaveAttribute(
                  "data-phase",
                  "paused",
                );
                const captureTick = await tick();
                await expect(page.locator("#boss-hud")).toBeVisible();
                const rawBefore = await page
                  .locator("canvas")
                  .evaluate((c: HTMLCanvasElement) => c.toDataURL());
                await writeFile(
                  `artifacts/phase-4/raw-before-${language}.png`,
                  Buffer.from(rawBefore.split(",")[1]!, "base64"),
                );
                const rawAfter = await page
                  .locator("canvas")
                  .evaluate((c: HTMLCanvasElement) => c.toDataURL());
                await writeFile(
                  `artifacts/phase-4/live-canvas-${language}.png`,
                  Buffer.from(rawAfter.split(",")[1]!, "base64"),
                );
                // Mobile paper has the existing wash gradient; assert both approved palette values.
                // Fixed approved swatch; browsers differ by one channel when rounding alpha blends.
                // Do not derive expected colors from the renderer or loosen pixel equality.
                const expectedSwatch = await page.evaluate((mobile) => {
                  const swatch = document.createElement("canvas");
                  swatch.width = 1;
                  swatch.height = 1;
                  const ctx = swatch.getContext("2d")!;
                  ctx.fillStyle = "#f2e7ce";
                  ctx.fillRect(0, 0, 1, 1);
                  if (mobile) {
                    ctx.fillStyle = "#6b8768";
                    ctx.globalAlpha = 0.048;
                    ctx.fillRect(0, 0, 1, 1);
                  }
                  return Array.from(ctx.getImageData(0, 0, 1, 1).data);
                }, virtual);
                const backdropPixels = () =>
                  page
                    .locator("canvas")
                    .evaluate((c: HTMLCanvasElement, expected: number[]) => {
                      const d = c
                        .getContext("2d")!
                        .getImageData(0, c.height - 8, c.width, 8).data;
                      let n = 0;
                      for (let i = 0; i < d.length; i += 4)
                        if (
                          d[i] === expected[0] &&
                          d[i + 1] === expected[1] &&
                          d[i + 2] === expected[2] &&
                          d[i + 3] === 255
                        )
                          n++;
                      return n;
                    }, expectedSwatch);
                for (let settle = 0; settle < 5; settle++) {
                  if (virtual) await page.clock.runFor(34);
                  if ((await backdropPixels()) > 1000) break;
                }
                assert.ok(
                  (await backdropPixels()) > 1000,
                  "live guardian canvas must paint its approved background palette",
                );
                await new Promise((resolve) => setTimeout(resolve, 50));
                await page.screenshot({
                  path: virtual
                    ? `artifacts/phase-4/virtual-ui-${language}-diagnostic.png`
                    : `artifacts/phase-4/paused-boss-${language}.png`,
                  fullPage: true,
                });
                if (!virtual) {
                  // The pause UI deliberately hides the world. Validate the
                  // actual native-clock canvas PNG, not the covering dialog.
                  const colors = await page.evaluate(async (encoded) => {
                    const bytes = Uint8Array.from(atob(encoded), (c) =>
                        c.charCodeAt(0),
                      ),
                      bitmap = await createImageBitmap(
                        new Blob([bytes], { type: "image/png" }),
                      ),
                      surface = document.createElement("canvas");
                    surface.width = bitmap.width;
                    surface.height = bitmap.height;
                    const ctx = surface.getContext("2d")!;
                    ctx.drawImage(bitmap, 0, 0);
                    bitmap.close();
                    const d = ctx.getImageData(
                        0,
                        0,
                        surface.width,
                        surface.height,
                      ).data,
                      palette = new Set();
                    for (let i = 0; i < d.length; i += 64)
                      palette.add(`${d[i]},${d[i + 1]},${d[i + 2]}`);
                    return palette.size;
                  }, rawAfter.split(",")[1]!);
                  assert.ok(
                    colors > 8,
                    "native-clock canvas PNG must contain the rendered guardian scene",
                  );
                }
                assert.equal(await tick(), captureTick);
                captured = true;
                await page.locator("#resume").click();
                if (virtual) {
                  for (
                    let n = 0;
                    n < 190 &&
                    (await page
                      .locator("#surface")
                      .getAttribute("data-phase")) !== "running";
                    n++
                  )
                    await page.clock.runFor(17);
                }
                await page.waitForFunction(
                  () =>
                    document.getElementById("surface")!.dataset["phase"] ===
                    "running",
                  undefined,
                  { polling: "raf" },
                );
              }
            }
            await until(witness.state.tick);
            assert.equal(
              await page.locator("#surface").getAttribute("data-hp"),
              "3",
            );
            assert.equal(captured, true);
            await page.locator("#pause").click();
            await page.locator("#quit").click();
            await page.locator("#confirm-quit").click();
            for (
              let n = 0;
              n < 80 &&
              (await page.locator("#result").getAttribute("data-status")) !==
                "VERIFIED";
              n++
            ) {
              if (virtual) await page.clock.runFor(300);
              await new Promise((r) => setTimeout(r, 40));
            }
            await expect(page.locator("#result")).toHaveAttribute(
              "data-status",
              "VERIFIED",
            );
            await expect(page.locator("#boss-results")).toContainText("+300");
            const out = (
              await fixture.db.pool.query(
                "SELECT state_hash FROM run_outcomes WHERE run_id=$1",
                [id],
              )
            ).rows[0];
            assert.equal(
              await page.locator("#surface").getAttribute("data-state-hash"),
              out.state_hash,
            );
            assert.equal(
              (
                await fixture.db.pool.query(
                  "SELECT count(*) AS n FROM player_boss_seals",
                )
              ).rows[0].n,
              "1",
            );
            await page.screenshot({
              path: `artifacts/phase-4/result-${language}.png`,
              fullPage: true,
            });
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              ),
              true,
            );
            assert.deepEqual(errors, []);
            assert.equal(
              await page.locator("html").getAttribute("data-qa-csp"),
              null,
            );
            assert.equal(
              await page.evaluate(
                () =>
                  getComputedStyle(document.documentElement).backgroundColor,
              ),
              "rgb(242, 231, 206)",
            );
          } finally {
            await context.close();
          }
        });
      }
    } finally {
      await browser.close();
      await fixture.close();
    }
  },
);

test(
  "4: four distinct guardian silhouettes and maximum corruption render from real core prefixes",
  { timeout: 120000 },
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
    await mkdir("artifacts/phase-4", { recursive: true });
    try {
      const page = await browser.newPage({
          viewport: { width: 1280, height: 900 },
        }),
        pictures = new Set();
      await page.goto(
        `http://127.0.0.1:${address.port}/tests/fixtures/boss-preview.html`,
      );
      await page.waitForFunction(
        () =>
          typeof (window as unknown as { previewBoss: unknown }).previewBoss ===
          "function",
      );
      for (const region of ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"]) {
        const result = await page.evaluate(
          async (region) =>
            await (
              window as unknown as {
                previewBoss: (
                  r: string,
                  c: number,
                ) => Promise<{ hp: number; boss: string }>;
              }
            ).previewBoss(region, region === "CASTLE" ? 4 : 1),
          region,
        );
        assert.equal(result.hp, 3);
        await page.waitForFunction(() => {
          const c = document.querySelector("canvas");
          return (
            c &&
            c.width > 0 &&
            c.getContext("2d")!.getImageData(c.width / 2, c.height / 2, 1, 1)
              .data[3] === 255
          );
        });
        const png = await page.locator("canvas").screenshot();
        pictures.add(png.toString("base64"));
        await page.screenshot({
          path: `artifacts/phase-4/study-${region}.png`,
          fullPage: true,
        });
      }
      assert.equal(pictures.size, 4);
    } finally {
      await browser.close();
      await server.close();
    }
  },
);

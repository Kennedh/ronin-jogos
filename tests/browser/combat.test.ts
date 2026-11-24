import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { portalFixture } from "../helpers/portal.ts";
import { COMBAT_MANIFEST, courseFor } from "@ronin/content/runner-manifest";
import { decodeSegment } from "@ronin/contracts/replay";
test(
  "2: live combat HUD, remapping and the shared animation preview",
  { timeout: 120000 },
  async (t) => {
    const fixture = await portalFixture(COMBAT_MANIFEST),
      chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe",
      browser = await chromium.launch(
        existsSync(chrome) ? { executablePath: chrome } : {},
      );
    await mkdir("artifacts/phase-2", { recursive: true });
    async function done(page: Page) {
      if (
        (await page.locator("#surface").getAttribute("data-phase")) ===
        "running"
      )
        await page.locator("#pause").click();
      await page.locator("#quit").click();
      await page.locator("#confirm-quit").click();
      await expect(page.locator("#result")).toHaveAttribute(
        "data-status",
        "VERIFIED",
        { timeout: 15000 },
      );
    }
    try {
      for (const mobile of [false, true])
        await t.test(
          mobile
            ? "EN mobile: gestures earn a perfect slash and concentration without overflow"
            : "PT desktop: earned perfect, HUD, pause and server state hash",
          async () => {
            await fixture.reset();
            const context = await browser.newContext({
              viewport: mobile
                ? { width: 844, height: 390 }
                : { width: 1280, height: 900 },
              isMobile: mobile,
              hasTouch: mobile,
            });
            const page = await context.newPage(),
              errors: string[] = [];
            page.on("pageerror", (e) => errors.push(e.message));
            try {
              await page.goto(
                fixture.origin +
                  (mobile ? "/roninrunner/en" : "/roninrunner/pt-br"),
              );
              await expect(page.locator("#play")).toBeEnabled();
              await page.clock.install();
              await page.clock.pauseAt(new Date(Date.now() + 1000));
              // A refused fullscreen still has to preserve this real combat flow.
              await page.locator("#fullscreen").uncheck();
              const response = page.waitForResponse((r) =>
                r.url().endsWith("/runs/start"),
              );
              await page.locator("#play").click();
              const ticket = await (await response).json();
              assert.equal(ticket.versions.rules_major, 2);
              const world = courseFor(COMBAT_MANIFEST, ticket.seed, 0, 2000000),
                obstacle = world.entities.find((e) => e.kind === "OBSTACLE")!,
                enemy = world.entities.find((e) => e.kind === "ENEMY")!;
              const surface = page.locator("#surface");
              await expect(surface).toHaveAttribute("data-phase", "running");
              const tick = async () =>
                Number(await surface.getAttribute("data-tick"));
              async function advanceTo(target: number) {
                for (
                  let frame = 0;
                  frame < target + 10 && (await tick()) < target;
                  frame++
                )
                  await page.clock.runFor(16);
                assert.equal(await tick(), target, "combat input tick");
              }
              // Real touch dispatch can take several frames on busy Windows hosts.
              // Freeze the simulation at the same tick for each CDP/keyboard event.
              await advanceTo(Math.floor((obstacle.x - 100000) / 6000));
              if (mobile) {
                const box = (await page.locator("#surface").boundingBox())!,
                  cdp = await context.newCDPSession(page),
                  x = box.x + box.width * 0.65,
                  y = box.y + box.height * 0.7;
                await cdp.send("Input.dispatchTouchEvent", {
                  type: "touchStart",
                  touchPoints: [{ x, y, id: 1 }],
                });
                await cdp.send("Input.dispatchTouchEvent", {
                  type: "touchMove",
                  touchPoints: [{ x, y: y - 50, id: 1 }],
                });
                await cdp.send("Input.dispatchTouchEvent", {
                  type: "touchEnd",
                  touchPoints: [],
                });
                await cdp.detach();
              } else await page.keyboard.press("Space");
              const attackAt = enemy.idealTick! - 4;
              await advanceTo(attackAt);
              if (mobile) {
                const box = (await page.locator("#surface").boundingBox())!;
                await page.touchscreen.tap(
                  box.x + box.width * 0.7,
                  box.y + box.height * 0.5,
                );
              } else await page.keyboard.press("KeyJ");
              await advanceTo(attackAt + 16);
              await expect(page.locator("#surface")).toHaveAttribute(
                "data-concentration",
                "12",
              );
              // Freeze the earned state before screenshot/HUD reads: capture latency
              // must not let the live runner reach the next hazard or auto-pause.
              await page.locator("#pause").click();
              await expect(page.locator("#surface")).toHaveAttribute(
                "data-phase",
                "paused",
              );
              const pausedTick = await tick();
              await expect(page.locator("#concentration")).toHaveJSProperty(
                "value",
                12,
              );
              await expect(page.locator("#surface")).toHaveAttribute(
                "data-combo",
                "1",
              );
              await expect(page.locator("#combat-feedback")).toHaveText(
                mobile ? "Perfect Slash" : "Corte perfeito",
              );
              await page.screenshot({
                path: `artifacts/phase-2/combat-${mobile ? "mobile-en" : "desktop-pt"}.png`,
                fullPage: true,
              });
              assert.equal(
                await page.evaluate(
                  () => document.documentElement.scrollWidth > innerWidth,
                ),
                false,
              );
              await page.clock.runFor(120);
              assert.equal(await tick(), pausedTick);
              assert.equal(
                await page
                  .locator("#surface")
                  .getAttribute("data-concentration"),
                "12",
              );
              await page.clock.resume();
              await done(page);
              const id = await page
                  .locator("#surface")
                  .getAttribute("data-run-id"),
                row = (
                  await fixture.db.pool.query(
                    "SELECT state_hash FROM run_outcomes WHERE run_id=$1",
                    [id],
                  )
                ).rows[0];
              await expect(page.locator("#surface")).toHaveAttribute(
                "data-state-hash",
                row.state_hash,
              );
              assert.deepEqual(errors, []);
              assert.deepEqual(fixture.failures, []);
            } finally {
              await context.close();
            }
          },
        );
      await t.test(
        "preview animates actual pixels, freezes/changes poses, cleans up and remaps persist",
        async () => {
          await fixture.reset();
          const context = await browser.newContext({
              viewport: { width: 1280, height: 1000 },
            }),
            page = await context.newPage(),
            errors: string[] = [];
          page.on("pageerror", (e) => errors.push(e.message));
          try {
            await page.goto(fixture.origin + "/roninrunner/pt-br");
            await expect(page.locator("#play")).toBeEnabled();
            await page.locator("#rig-lab summary").click();
            const preview = page.locator("#rig-preview canvas");
            await expect(preview).toBeVisible();
            const pixels = () =>
              preview.evaluate(async (el) => {
                const canvas = el as HTMLCanvasElement;
                const rgba = canvas
                  .getContext("2d")!
                  .getImageData(0, 0, canvas.width, canvas.height).data;
                const digest = await crypto.subtle.digest("SHA-256", rgba);
                return Array.from(new Uint8Array(digest), (byte) =>
                  byte.toString(16).padStart(2, "0"),
                ).join("");
              });
            await page.clock.install();
            await page.clock.pauseAt(new Date(Date.now() + 1000));
            const image = await pixels();
            await page.clock.runFor(160);
            assert.notEqual(await pixels(), image, "the rig must animate");
            await page.locator("#rig-play").uncheck();
            await page.clock.runFor(32);
            const frozen = await pixels();
            const frame = await preview.getAttribute("data-frame");
            await page.clock.runFor(160);
            assert.equal(await preview.getAttribute("data-frame"), frame);
            assert.equal(
              await pixels(),
              frozen,
              "the paused pose must keep the same pixels",
            );
            await page.locator("#rig-animation").selectOption("ATTACK_ACTIVE");
            await page.clock.runFor(32);
            await expect(preview).toHaveAttribute(
              "data-animation",
              "ATTACK_ACTIVE",
            );
            assert.notEqual(
              await pixels(),
              frozen,
              "changing pose must repaint the canvas",
            );
            await page.clock.resume();
            await page.locator("#rig-debug").check();
            await page.screenshot({
              path: "artifacts/phase-2/rig-study.png",
              fullPage: true,
            });
            await page.locator("#rig-animation").selectOption("SPECIAL");
            await expect(preview).toHaveAttribute("data-animation", "SPECIAL");
            await page.screenshot({
              path: "artifacts/phase-2/rig-special.png",
              fullPage: true,
            });
            await page.evaluate(() =>
              window.dispatchEvent(
                new PageTransitionEvent("pagehide", { persisted: true }),
              ),
            );
            await expect(preview).toHaveCount(0);
            await page.evaluate(() =>
              window.dispatchEvent(
                new PageTransitionEvent("pageshow", { persisted: true }),
              ),
            );
            await expect(preview).toBeVisible();
            await page.locator("#rig-animation").selectOption("SLIDE_LOOP");
            await expect(preview).toHaveAttribute(
              "data-animation",
              "SLIDE_LOOP",
            );
            await page.locator("#rig-lab summary").click();
            await expect(preview).toHaveCount(0);
            assert.equal(await page.locator("canvas").count(), 1);
            await page.locator("#bind-JUMP").press("KeyK");
            await expect(page.locator("#bind-JUMP")).toHaveValue("K");
            await page.locator("#bind-ATTACK").press("KeyK");
            await expect(page.locator("#binding-error")).toBeVisible();
            await page.locator("#bind-ATTACK").press("KeyL");
            await expect(page.locator("#binding-error")).toBeHidden();
            await page.reload();
            await expect(page.locator("#play")).toBeEnabled();
            await expect(page.locator("#bind-JUMP")).toHaveValue("K");
            await expect(page.locator("#bind-ATTACK")).toHaveValue("L");
            await page.locator("#play").click();
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "running",
            );
            await page.keyboard.press("KeyK");
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-jumps",
              "1",
            );
            await page.keyboard.press("Space");
            await page.keyboard.press("KeyL");
            await page.waitForFunction(
              () =>
                Number(
                  document.querySelector<HTMLElement>("#surface")?.dataset[
                    "attackAge"
                  ],
                ) > 0,
            );
            await done(page);
            const id = await page
                .locator("#surface")
                .getAttribute("data-run-id"),
              rows = await fixture.db.pool.query(
                "SELECT payload FROM run_segments WHERE run_id=$1 ORDER BY segment_index",
                [id],
              );
            const actions = rows.rows.flatMap(
              (r) => decodeSegment(r.payload).actions,
            );
            assert.equal(actions.filter((a) => a.action === "JUMP").length, 1);
            assert.equal(
              actions.filter((a) => a.action === "ATTACK").length,
              1,
            );
            assert.deepEqual(errors, []);
          } finally {
            await context.close();
          }
        },
      );
    } finally {
      await browser.close();
      await fixture.close();
    }
  },
);

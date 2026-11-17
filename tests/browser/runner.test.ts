import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { portalFixture } from "../helpers/portal.ts";
import { decodeSegment } from "@ronin/contracts/replay";

test(
  "1D: built Phaser client with CSP, real API/Postgres and verifier",
  { timeout: 240000 },
  async (t) => {
    const fixture = await portalFixture();
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
    const browser = await chromium.launch(
      existsSync(chrome) ? { executablePath: chrome } : {},
    );
    await mkdir("artifacts/phase-1d", { recursive: true });
    async function pageFor(
      options: Parameters<typeof browser.newContext>[0] = {},
    ) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        locale: "pt-BR",
        ...options,
      });
      const page = await context.newPage(),
        errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("requestfailed", (request) => {
        if (request.url().includes("/api/"))
          console.log(
            "QA request failed",
            new URL(request.url()).pathname,
            request.failure()?.errorText,
          );
      });
      page.on("response", (response) => {
        if (response.url().includes("/api/") && !response.ok())
          console.log(
            "QA API status",
            new URL(response.url()).pathname,
            response.status(),
          );
      });
      await page.addInitScript(() => {
        const w = window as unknown as { qaCsp: string[] };
        w.qaCsp = [];
        document.addEventListener("securitypolicyviolation", (event) =>
          w.qaCsp.push(event.violatedDirective + ":" + event.blockedURI),
        );
      });
      return { context, page, errors };
    }
    async function ready(page: Page, path = "/roninrunner/pt-br") {
      await page.goto(fixture.origin + path);
      await expect(page.locator("#play")).toBeEnabled({ timeout: 20000 });
    }
    async function start(page: Page) {
      await page.locator("#play").click();
      await expect(page.locator("#surface")).toHaveAttribute(
        "data-phase",
        /running|paused/,
        { timeout: 10000 },
      );
    }
    async function verified(page: Page) {
      await expect(page.locator("#result")).toHaveAttribute(
        "data-status",
        "VERIFIED",
        { timeout: 15000 },
      );
    }
    async function noErrors(page: Page, errors: string[]) {
      assert.deepEqual(errors, []);
      assert.deepEqual(
        await page.evaluate(
          () => (window as unknown as { qaCsp: string[] }).qaCsp,
        ),
        [],
      );
      assert.deepEqual(fixture.failures, []);
    }
    async function quit(page: Page) {
      if (
        (await page.locator("#surface").getAttribute("data-phase")) ===
        "running"
      )
        await page.locator("#pause").click();
      await page.locator("#quit").click();
      await page.locator("#confirm-quit").click();
    }
    async function parts(id: string) {
      const rows = await fixture.db.pool.query<{ payload: Buffer }>(
        "SELECT payload FROM run_segments WHERE run_id=$1 ORDER BY segment_index",
        [id],
      );
      return rows.rows.map((row) => decodeSegment(row.payload));
    }
    try {
      await t.test(
        "PT desktop: real scene, complete run, matching state hash and server-confirmed result",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            await page.screenshot({
              path: "artifacts/phase-1d/menu-pt-desktop.png",
              fullPage: true,
            });
            const palette = await page.evaluate(() => ({
              background: getComputedStyle(document.documentElement)
                .backgroundColor,
              ink: getComputedStyle(document.documentElement).color,
              overflow: document.documentElement.scrollWidth > innerWidth,
            }));
            assert.deepEqual(palette, {
              background: "rgb(242, 231, 206)",
              ink: "rgb(42, 37, 40)",
              overflow: false,
            });
            const colors = await page.locator("canvas").evaluate((node) => {
              const canvas = node as HTMLCanvasElement,
                ctx = canvas.getContext("2d")!;
              return new Set(
                Array.from({ length: 30 }, (_, i) =>
                  Array.from(
                    ctx.getImageData((i * 47) % 1200, (i * 43) % 650, 1, 1)
                      .data,
                  ).join(","),
                ),
              ).size;
            });
            assert.ok(colors > 8, "scene must draw real nonuniform pixels");
            await start(page);
            const id = (await page
              .locator("#surface")
              .getAttribute("data-run-id"))!;
            await verified(page);
            assert.equal(
              await page.locator("#surface").getAttribute("data-end-reason"),
              "ABYSS",
            );
            await expect(page.locator("#result-label")).toHaveText(
              "Resultado confirmado",
            );
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-state-hash",
              /^[a-f0-9]{64}$/,
            );
            const out = (
              await fixture.db.pool.query(
                "SELECT score,state_hash,ranked FROM run_outcomes WHERE run_id=$1",
                [id],
              )
            ).rows[0];
            assert.equal(
              out.state_hash,
              await page.locator("#surface").getAttribute("data-state-hash"),
            );
            assert.equal(out.ranked, true);
            const shown = (
              await page.locator("#result-score").innerText()
            ).replace(/[^0-9]/g, "");
            assert.equal(shown, out.score);
            await page.screenshot({
              path: "artifacts/phase-1d/result-pt-desktop.png",
              fullPage: true,
            });
            await noErrors(page, errors);
          } catch (error) {
            console.log(
              "QA browser failures",
              errors,
              await page.evaluate(
                () => (window as unknown as { qaCsp: string[] }).qaCsp,
              ),
            );
            await page.screenshot({
              path: "artifacts/phase-1d/failure-smoke.png",
              fullPage: true,
            });
            throw error;
          } finally {
            await context.close();
          }
        },
      );

      await t.test(
        "keyboard, repeated keys, shielded pause, countdown and language switch keep the same run",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            await start(page);
            const id = (await page
              .locator("#surface")
              .getAttribute("data-run-id"))!;
            await page.keyboard.down("Space");
            await page.waitForFunction(
              () =>
                document.querySelector<HTMLElement>("#surface")?.dataset[
                  "jumps"
                ] === "1",
            );
            await page.keyboard.down("Space");
            await page.waitForTimeout(50);
            assert.equal(
              await page.locator("#surface").getAttribute("data-jumps"),
              "1",
            );
            await page.keyboard.up("Space");
            await page.keyboard.press("Space");
            await page.waitForFunction(
              () =>
                document.querySelector<HTMLElement>("#surface")?.dataset[
                  "jumps"
                ] === "2",
            );
            const beforeThird = Number(
              await page.locator("#surface").getAttribute("data-tick"),
            );
            await page.keyboard.press("Space");
            await page.waitForFunction(
              (tick) =>
                Number(
                  document.querySelector<HTMLElement>("#surface")?.dataset[
                    "tick"
                  ],
                ) > tick,
              beforeThird,
            );
            assert.equal(
              await page.locator("#surface").getAttribute("data-jumps"),
              "2",
            );
            await page.keyboard.press("j");
            await page.waitForFunction(
              () =>
                Number(
                  document.querySelector<HTMLElement>("#surface")?.dataset[
                    "attackAge"
                  ],
                ) >= 0,
            );
            await page.keyboard.press("Escape");
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "paused",
            );
            const tick = await page
              .locator("#surface")
              .getAttribute("data-tick");
            await page.waitForTimeout(180);
            assert.equal(
              await page.locator("#surface").getAttribute("data-tick"),
              tick,
            );
            assert.equal(
              await page
                .locator("#surface")
                .evaluate((el) => getComputedStyle(el).visibility),
              "hidden",
            );
            await page.screenshot({
              path: "artifacts/phase-1d/pause-pt-desktop.png",
              fullPage: true,
            });
            await page.keyboard.press("j");
            await page.locator('#pause-panel [data-language="en"]').click();
            await expect(page.locator("html")).toHaveAttribute("lang", "en");
            assert.equal(
              await page.locator("#surface").getAttribute("data-run-id"),
              id,
            );
            await expect(page.locator("#resume")).toHaveText(
              "Continue · 3–2–1",
            );
            await page.locator("#resume").click();
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "countdown",
            );
            await page.keyboard.press("j");
            await page.waitForTimeout(600);
            assert.equal(
              await page.locator("#surface").getAttribute("data-tick"),
              tick,
            );
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "running",
              { timeout: 5000 },
            );
            await quit(page);
            await verified(page);
            assert.match(
              await page.locator("#result-status").innerText(),
              /not eligible/,
            );
            const payloads = await parts(id),
              actions = payloads.flatMap((p) => p.actions),
              controls = payloads.flatMap((p) => p.controls);
            assert.equal(actions.filter((a) => a.action === "JUMP").length, 3);
            assert.equal(
              actions.filter((a) => a.action === "ATTACK").length,
              1,
            );
            assert.deepEqual(
              controls.map((c) => c.action),
              ["PAUSE", "RESUME", "PAUSE", "QUIT"],
            );
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "queued replay is never shown as confirmed while the verifier is unavailable",
        async () => {
          await fixture.reset();
          fixture.worker(false);
          const { context, page, errors } = await pageFor();
          try {
            await ready(page, "/roninrunner/en");
            await start(page);
            await expect(page.locator("#result")).toHaveAttribute(
              "data-status",
              "PENDING",
              { timeout: 12000 },
            );
            await expect(page.locator("#result-label")).toHaveText(
              "Estimated on this device",
            );
            assert.match(
              await page.locator("#result-status").innerText(),
              /Awaiting verification/,
            );
            assert.equal(
              (await fixture.db.pool.query("SELECT count(*) FROM run_outcomes"))
                .rows[0].count,
              "0",
            );
            fixture.worker(true);
            await verified(page);
            await expect(page.locator("#result-label")).toHaveText(
              "Confirmed result",
            );
            await noErrors(page, errors);
          } finally {
            fixture.worker(true);
            await context.close();
          }
        },
      );
      await t.test(
        "offline result preserves its buffer and retries against the same authoritative run",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            await start(page);
            const id = (await page
              .locator("#surface")
              .getAttribute("data-run-id"))!;
            await page.route("**/api/**", (route) =>
              route.abort("internetdisconnected"),
            );
            await expect(page.locator("#result")).toBeVisible({
              timeout: 10000,
            });
            await expect(page.locator("#connection")).toBeVisible();
            await expect(page.locator("#new-run")).toBeDisabled();
            await expect(page.locator("#result-label")).toHaveText(
              "Estimativa neste dispositivo",
            );
            assert.equal(
              (await fixture.db.pool.query("SELECT count(*) FROM run_outcomes"))
                .rows[0].count,
              "0",
            );
            let protectedExit = false;
            page.once("dialog", async (dialog) => {
              assert.equal(dialog.type(), "beforeunload");
              protectedExit = true;
              await dialog.dismiss();
            });
            await page.locator(".wordmark").click({ noWaitAfter: true });
            await page.waitForTimeout(150);
            assert.equal(protectedExit, true);
            assert.match(page.url(), /roninrunner/);
            await page.unroute("**/api/**");
            await page.locator("#retry").click();
            await verified(page);
            assert.equal(
              await page.locator("#surface").getAttribute("data-run-id"),
              id,
            );
            assert.equal(
              (
                await fixture.db.pool.query(
                  "SELECT count(*) FROM run_outcomes WHERE run_id=$1",
                  [id],
                )
              ).rows[0].count,
              "1",
            );
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "finish ACK lost after commit reuses the exact commitment and deadline",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            let first = true;
            const sent: string[] = [];
            await page.route("**/api/v1/runs/*/finish", async (route) => {
              sent.push(route.request().postData()!);
              const response = await route.fetch();
              if (first) {
                first = false;
                await route.abort("failed");
              } else await route.fulfill({ response });
            });
            await start(page);
            await expect(page.locator("#connection")).toBeVisible({
              timeout: 12000,
            });
            const id = (await page
                .locator("#surface")
                .getAttribute("data-run-id"))!,
              before = (
                await fixture.db.pool.query(
                  "SELECT upload_deadline FROM runs WHERE id=$1",
                  [id],
                )
              ).rows[0].upload_deadline as Date;
            await page.locator("#retry").click();
            await verified(page);
            assert.equal(sent.length, 2);
            assert.equal(sent[0], sent[1]);
            const after = (
              await fixture.db.pool.query(
                "SELECT upload_deadline FROM runs WHERE id=$1",
                [id],
              )
            ).rows[0].upload_deadline as Date;
            assert.equal(after.toISOString(), before.toISOString());
            assert.equal(
              (
                await fixture.db.pool.query(
                  "SELECT count(*) FROM outbox_events WHERE run_id=$1",
                  [id],
                )
              ).rows[0].count,
              "1",
            );
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "lost start response retries the original key and creates only one run",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            let first = true;
            const keys: string[] = [];
            await page.route("**/api/v1/runs/start", async (route) => {
              keys.push(route.request().headers()["idempotency-key"]!);
              const response = await route.fetch();
              if (first) {
                first = false;
                await route.abort("failed");
              } else await route.fulfill({ response });
            });
            await page.locator("#play").click();
            await expect(page.locator("#start-error")).toBeVisible();
            await expect(page.locator("#play")).toBeEnabled();
            await start(page);
            assert.equal(keys.length, 2);
            assert.equal(keys[0], keys[1]);
            assert.equal(
              (await fixture.db.pool.query("SELECT count(*) FROM runs")).rows[0]
                .count,
              "1",
            );
            await verified(page);
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "server-rejected finish remains rejected in the UI without a confirmed score",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            await page.route("**/api/v1/runs/*/finish", async (route) => {
              const body = route.request().postDataJSON() as Record<
                string,
                unknown
              >;
              await route.continue({
                postData: JSON.stringify({ ...body, end_reason: "HP_ZERO" }),
              });
            });
            await start(page);
            await expect(page.locator("#result")).toHaveAttribute(
              "data-status",
              "REJECTED",
              { timeout: 12000 },
            );
            await expect(page.locator("#result-label")).toHaveText(
              "Estimativa neste dispositivo",
            );
            assert.match(
              await page.locator("#result-status").innerText(),
              /Não foi possível/,
            );
            assert.equal(
              (await fixture.db.pool.query("SELECT count(*) FROM run_outcomes"))
                .rows[0].count,
              "0",
            );
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "regional mode and optional action buttons send the same tick commands once",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            await page.locator("#mode").selectOption("REGIONAL");
            await page.locator("#alternate").check();
            await page.locator("#reduced").check();
            await start(page);
            await page.locator('[data-action="SLIDE"]').focus();
            await page.keyboard.press("Space");
            await page.waitForFunction(
              () =>
                Number(
                  document.querySelector<HTMLElement>("#surface")?.dataset[
                    "slideUntil"
                  ],
                ) > 0,
            );
            await quit(page);
            await verified(page);
            const id = (await page
              .locator("#surface")
              .getAttribute("data-run-id"))!;
            assert.equal(
              (
                await fixture.db.pool.query(
                  "SELECT mode FROM runs WHERE id=$1",
                  [id],
                )
              ).rows[0].mode,
              "REGIONAL",
            );
            assert.equal(
              (await parts(id))
                .flatMap((p) => p.actions)
                .filter((a) => a.action === "SLIDE").length,
              1,
            );
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "mobile gestures, tap and fullscreen refusal preserve a playable landscape view",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor({
            viewport: { width: 844, height: 390 },
            isMobile: true,
            hasTouch: true,
            deviceScaleFactor: 1,
          });
          try {
            await page.addInitScript(() => {
              (window as unknown as { qaFullscreen: number }).qaFullscreen = 0;
              Element.prototype.requestFullscreen = () => {
                (window as unknown as { qaFullscreen: number }).qaFullscreen++;
                return Promise.reject(
                  new DOMException("fixture_denied", "NotAllowedError"),
                );
              };
            });
            await ready(page, "/roninrunner/en");
            await start(page);
            await expect(page.locator("#immersive-note")).toBeVisible();
            await expect(page.locator(".touch-help")).toBeVisible();
            await expect(page.locator(".keyboard-help")).toBeHidden();
            assert.equal(
              await page.evaluate(
                () =>
                  (window as unknown as { qaFullscreen: number }).qaFullscreen,
              ),
              1,
            );
            const camera = await page.locator("canvas").evaluate((node) => ({
              width: node.getBoundingClientRect().width,
              height: (node as HTMLCanvasElement).height,
            }));
            const surfaceWidth = (await page.locator("#surface").boundingBox())!
              .width;
            assert.ok(camera.width >= surfaceWidth * 0.95);
            assert.ok(camera.height >= 360 && camera.height < 500);
            const rect = (await page.locator("#surface").boundingBox())!,
              x = Math.round(rect.x + rect.width * 0.65),
              y = Math.round(rect.y + rect.height * 0.6),
              cdp = await context.newCDPSession(page);
            await page.touchscreen.tap(x, y);
            await page.waitForFunction(
              () =>
                Number(
                  document.querySelector<HTMLElement>("#surface")?.dataset[
                    "attackAge"
                  ],
                ) >= 0,
            );
            const swipe = async () => {
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
            };
            await swipe();
            await page.waitForFunction(
              () =>
                document.querySelector<HTMLElement>("#surface")?.dataset[
                  "jumps"
                ] === "1",
            );
            await swipe();
            await page.waitForFunction(
              () =>
                document.querySelector<HTMLElement>("#surface")?.dataset[
                  "jumps"
                ] === "2",
            );
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchStart",
              touchPoints: [
                { x, y, id: 1 },
                { x: x + 30, y, id: 2 },
              ],
            });
            // Lift one finger, keep the second down, then introduce a third.
            // Implicit lostpointercapture from the first must not reset ambiguity.
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchEnd",
              touchPoints: [{ x: x + 30, y, id: 2 }],
            });
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchStart",
              touchPoints: [
                { x: x + 30, y, id: 2 },
                { x: x + 60, y, id: 3 },
              ],
            });
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [
                { x: x + 30, y, id: 2 },
                { x: x + 60, y: y - 50, id: 3 },
              ],
            });
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchEnd",
              touchPoints: [],
            });
            await cdp.detach();
            await page.screenshot({
              path: "artifacts/phase-1d/game-en-mobile-landscape.png",
              fullPage: true,
            });
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth > innerWidth,
              ),
              false,
            );
            await quit(page);
            await verified(page);
            const id = (await page
                .locator("#surface")
                .getAttribute("data-run-id"))!,
              actions = (await parts(id)).flatMap((p) => p.actions);
            assert.equal(
              actions.filter((a) => a.action === "ATTACK").length,
              1,
            );
            assert.equal(actions.filter((a) => a.action === "JUMP").length, 2);
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "portrait fallback and orientation/focus pause shield the world without advancing ticks",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor({
            viewport: { width: 390, height: 844 },
            isMobile: true,
            hasTouch: true,
            deviceScaleFactor: 1,
          });
          try {
            await ready(page);
            await page.locator("#fullscreen").uncheck();
            await start(page);
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "paused",
            );
            assert.equal(
              await page.locator("#surface").getAttribute("data-tick"),
              "0",
            );
            await expect(page.locator("#resume")).toBeDisabled();
            await expect(page.locator("#portrait")).toBeVisible();
            await page.screenshot({
              path: "artifacts/phase-1d/portrait-pause.png",
              fullPage: true,
            });
            await page.locator("#portrait").click();
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "countdown",
            );
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "running",
              { timeout: 5000 },
            );
            await page.setViewportSize({ width: 844, height: 390 });
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "paused",
            );
            const tick = await page
              .locator("#surface")
              .getAttribute("data-tick");
            await page.waitForTimeout(150);
            assert.equal(
              await page.locator("#surface").getAttribute("data-tick"),
              tick,
            );
            await quit(page);
            await verified(page);
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );
      await t.test(
        "hub navigation and both localized routes work; locale preference survives a reload",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            const requests: string[] = [];
            page.on("request", (request) => requests.push(request.url()));
            await page.goto(fixture.origin + "/");
            await expect(page.locator("h1")).toHaveText(
              "Pequenos mundos. Desafios reais.",
            );
            assert.equal(
              requests.some((url) => url.includes("scene-")),
              false,
            );
            await page.locator("#hub-play").click();
            await expect(page.locator("#play")).toBeEnabled({ timeout: 20000 });
            await page.locator('.masthead [data-language="en"]').click();
            await expect(page.locator("html")).toHaveAttribute("lang", "en");
            await page.goto(fixture.origin + "/roninrunner");
            await expect(page.locator("#play")).toBeEnabled({ timeout: 20000 });
            assert.equal(await page.locator("html").getAttribute("lang"), "en");
            await page.evaluate(() => {
              window.dispatchEvent(
                new PageTransitionEvent("pagehide", { persisted: true }),
              );
              window.dispatchEvent(
                new PageTransitionEvent("pageshow", { persisted: true }),
              );
            });
            await expect(page.locator("#play")).toBeEnabled();
            await page.locator(".wordmark").click();
            await page.goBack();
            await expect(page.locator("#play")).toBeEnabled({ timeout: 20000 });
            await noErrors(page, errors);
          } finally {
            await context.close();
          }
        },
      );

      await t.test(
        "focus loss freezes competitive state and keeps the replay verifiable",
        async () => {
          await fixture.reset();
          const { context, page, errors } = await pageFor();
          try {
            await ready(page);
            await start(page);
            await page.evaluate(() => window.dispatchEvent(new Event("blur")));
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "paused",
            );
            const tick = await page
              .locator("#surface")
              .getAttribute("data-tick");
            await page.waitForTimeout(200);
            assert.equal(
              await page.locator("#surface").getAttribute("data-tick"),
              tick,
            );
            assert.match(await page.locator("#pause-hint").innerText(), /foco/);
            await quit(page);
            await verified(page);
            await noErrors(page, errors);
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

import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { portalFixture } from "../helpers/portal.ts";
import { FOUNDATION_MANIFEST } from "@ronin/content/runner-manifest";
import { deliverAuthMail } from "@ronin/data";
import type { AuthMail } from "@ronin/data";
test(
  "5A: real account forms, private local mail, sessions and authenticated game in PT/EN",
  { timeout: 180000 },
  async (t) => {
    let now = Date.now();
    const key = Buffer.alloc(32, 51),
      fixture = await portalFixture(
        FOUNDATION_MANIFEST,
        () => new Date(now),
        key,
      ),
      chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe",
      browser = await chromium.launch(
        existsSync(chrome) ? { executablePath: chrome } : {},
      ),
      mails: AuthMail[] = [];
    const drain = async () => {
      for (let n = 0; n < 20; n++) {
        const r = await deliverAuthMail(
          fixture.db.pool,
          key,
          {
            async send(_id, m) {
              mails.push(m);
            },
          },
          () => new Date(now),
        );
        if (r === "IDLE") return;
      }
      throw new Error("mail_drain_budget");
    };
    const latest = (to: string, purpose: "VERIFY" | "RESET") => {
      const m = mails
        .filter((m) => m.to === to && m.purpose === purpose)
        .at(-1);
      assert.ok(m);
      return m;
    };
    const path = (m: AuthMail) => {
      const url = new URL(m.link);
      return fixture.origin + url.pathname + url.hash;
    };
    await mkdir("artifacts/phase-5a", { recursive: true });
    try {
      for (const lang of ["pt-br", "en"])
        await t.test(lang, async () => {
          await fixture.reset();
          mails.length = 0;
          const mobile = lang === "en",
            context = await browser.newContext({
              viewport: mobile
                ? { width: 390, height: 844 }
                : { width: 1280, height: 960 },
              hasTouch: mobile,
              isMobile: mobile,
            }),
            page = await context.newPage(),
            errors: string[] = [];
          page.on("pageerror", (e) => errors.push(e.message));
          await page.addInitScript(() =>
            document.addEventListener(
              "securitypolicyviolation",
              (e) =>
                (document.documentElement.dataset["qaCsp"] =
                  e.violatedDirective),
            ),
          );
          const email = lang + "@example.test",
            password = "a full browser fixture passphrase";
          try {
            let releaseBootstrap!: () => void;
            const bootstrapGate = new Promise<void>((resolve) => {
              releaseBootstrap = resolve;
            });
            await page.route("**/api/v1/auth/guest", async (route) => {
              await bootstrapGate;
              await route.continue();
            });
            try {
              await page.goto(fixture.origin + "/account/" + lang);
              await expect(page.locator("#account-message")).toHaveText(
                lang === "pt-br" ? "Aguarde…" : "Working…",
              );
              await expect(page.locator("#register-email")).toBeDisabled();
              await expect(
                page.locator("#account-register-form button"),
              ).toBeDisabled();
            } finally {
              releaseBootstrap();
            }
            await expect(page.locator("#register-email")).toBeEnabled();
            await page.unroute("**/api/v1/auth/guest");
            await expect(page.locator("#account-state")).toHaveText(
              lang === "pt-br" ? "Visitante" : "Guest",
            );
            const before = (
              await context.request.post(
                fixture.origin + "/api/v1/auth/guest",
                { headers: { Origin: fixture.origin }, data: {} },
              )
            ).json();
            const player = (await before).player_id;
            const nickname =
              lang === "pt-br" ? "Ronin Browser PT" : "Ronin Browser EN";
            await page.locator("#account-profile-nickname").fill(nickname);
            await page.locator("#account-public-profile").check();
            await page.locator("#account-profile-form button").click();
            await expect(page.locator("#account-message")).toHaveText(
              lang === "pt-br" ? "Perfil salvo." : "Profile saved.",
            );
            await expect(page.locator("#account-name")).toHaveText(nickname);
            await page.reload();
            await expect(page.locator("#account-profile-nickname")).toHaveValue(
              nickname,
            );
            await expect(page.locator("#account-public-profile")).toBeChecked();
            await expect(page.locator("#register-nickname")).toHaveValue(
              nickname,
            );
            await page.locator("#register-email").fill(email);
            await page.locator("#register-password").fill(password);
            await page.locator("#account-register-form button").click();
            await expect(page.locator("#account-state")).toHaveText(
              lang === "pt-br"
                ? "Confirmação de e-mail pendente"
                : "Email confirmation pending",
            );
            await expect(page.locator("#register-password")).toHaveValue("");
            await drain();
            const first = latest(email, "VERIFY");
            assert.equal(first.locale, lang === "pt-br" ? "pt-BR" : "en");
            assert.equal(
              (
                await fixture.db.pool.query(
                  "SELECT count(*) AS n FROM email_accounts",
                )
              ).rows[0].n,
              "0",
            );
            // Link GET alone must not prove email, and another browser cannot consume it.
            const wrong = await browser.newContext(),
              wrongPage = await wrong.newPage();
            try {
              await wrongPage.goto(path(first));
              await expect(wrongPage.locator("#account-verify")).toBeVisible();
              await wrongPage.locator("#account-verify").click();
              await expect(wrongPage.locator("#account-error")).toContainText(
                lang === "pt-br" ? "navegador" : "browser",
              );
              assert.equal(
                (
                  await fixture.db.pool.query(
                    "SELECT count(*) AS n FROM email_accounts",
                  )
                ).rows[0].n,
                "0",
              );
            } finally {
              await wrong.close();
            }
            now += 61000;
            await page.locator("#account-resend").click();
            await expect(page.locator("#account-resend")).toBeEnabled();
            await drain();
            const current = latest(email, "VERIFY");
            assert.notEqual(current.link, first.link);
            await page.goto(path(current));
            await expect(page.locator("#account-verify")).toBeVisible();
            assert.equal(new URL(page.url()).hash, "");
            assert.equal(
              (
                await fixture.db.pool.query(
                  "SELECT count(*) AS n FROM email_accounts",
                )
              ).rows[0].n,
              "0",
            );
            await page.locator("#account-verify").click();
            await expect(page.locator("#account-state")).toHaveText(
              lang === "pt-br" ? "E-mail confirmado" : "Email confirmed",
            );
            await expect(page.locator("#account-sessions article")).toHaveCount(
              1,
            );
            const after = await context.request.get(
              fixture.origin + "/api/v1/me",
            );
            assert.equal((await after.json()).player_id, player);
            const secondary = await browser.newContext(),
              secondPage = await secondary.newPage();
            try {
              await secondPage.goto(fixture.origin + "/account/" + lang);
              await expect(secondPage.locator("#account-state")).toHaveText(
                lang === "pt-br" ? "Visitante" : "Guest",
              );
              await secondPage.locator("#login-email").fill(email);
              await secondPage.locator("#login-password").fill(password);
              await secondPage.locator("#account-login-form button").click();
              await expect(
                secondPage.locator("#account-sessions article"),
              ).toHaveCount(2);
              now += 600001;
              await page.locator("#account-sessions-refresh").click();
              await expect(page.locator("#account-reauth-form")).toBeVisible();
              await page.locator("#reauth-password").fill(password);
              await page.locator("#account-reauth-form button").click();
              await expect(
                page.locator("#account-sessions article"),
              ).toHaveCount(2);
              await page
                .locator("#account-sessions button:not([disabled])")
                .click();
              await expect(
                page.locator("#account-sessions article"),
              ).toHaveCount(1);
              assert.equal(
                (
                  await secondary.request.get(fixture.origin + "/api/v1/me")
                ).status(),
                401,
              );
            } finally {
              await secondary.close();
            }
            await page.screenshot({
              path: `artifacts/phase-5a/account-${lang}.png`,
              fullPage: true,
            });
            await page.locator("#account-logout").click();
            await expect(page.locator("#account-state")).toHaveText(
              lang === "pt-br" ? "Visitante" : "Guest",
            );
            await page
              .locator("#account-forgot-form")
              .evaluate(
                (e) =>
                  ((e.closest("details") as HTMLDetailsElement).open = true),
              );
            await page.locator("#forgot-email").fill(email);
            now += 61000;
            await page.locator("#account-forgot-form button").click();
            await expect(
              page.locator("#account-forgot-form button"),
            ).toBeEnabled();
            await drain();
            await page.goto(path(latest(email, "RESET")));
            await expect(page.locator("#reset-panel")).toBeVisible();
            assert.equal(new URL(page.url()).hash, "");
            const newPassword = "a renewed browser fixture passphrase";
            await page.locator("#reset-password").fill(newPassword);
            await page.locator("#account-reset-form button").click();
            await expect(page.locator("#account-message")).toContainText(
              lang === "pt-br" ? "Senha atualizada" : "Password updated",
            );
            await page.locator("#login-email").fill(email);
            await page.locator("#login-password").fill(newPassword);
            await page.locator("#account-login-form button").click();
            await expect(page.locator("#account-state")).toHaveText(
              lang === "pt-br" ? "E-mail confirmado" : "Email confirmed",
            );
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              ),
              true,
            );
            assert.equal(
              await page.evaluate(
                () =>
                  getComputedStyle(document.documentElement).backgroundColor,
              ),
              "rgb(242, 231, 206)",
            );
            assert.equal(
              await page.locator("html").getAttribute("data-qa-csp"),
              null,
            );
            assert.deepEqual(errors, []);
            assert.equal(
              (
                await context.request.get(
                  fixture.origin + "/artifacts/dev-auth/inbox",
                )
              ).status(),
              404,
            );
            // Registered identity uses the unchanged real game and verifier.
            if (mobile) await page.setViewportSize({ width: 844, height: 390 });
            await page.locator("#account-back").click();
            await expect(page.locator("#play")).toBeEnabled();
            await page.locator("#fullscreen").uncheck();
            await page.locator("#play").click();
            await expect(page.locator("#surface")).toHaveAttribute(
              "data-phase",
              "running",
            );
            const run = await page
              .locator("#surface")
              .getAttribute("data-run-id");
            await page.locator("#pause").click();
            await page.locator("#quit").click();
            await page.locator("#confirm-quit").click();
            await expect(page.locator("#result")).toHaveAttribute(
              "data-status",
              "VERIFIED",
              { timeout: 15000 },
            );
            assert.equal(
              (
                await fixture.db.pool.query(
                  "SELECT player_id FROM runs WHERE id=$1",
                  [run],
                )
              ).rows[0].player_id,
              player,
            );
          } finally {
            await context.close();
          }
        });
      await t.test(
        "temporary bootstrap outage cannot discard an existing visitor",
        async () => {
          await fixture.reset();
          const context = await browser.newContext(),
            page = await context.newPage();
          let fail = false;
          try {
            await page.goto(fixture.origin + "/account/en");
            await expect(page.locator("#register-email")).toBeEnabled();
            const before = (
              await fixture.db.pool.query("SELECT id FROM players")
            ).rows[0].id;
            fail = true;
            await page.route("**/api/v1/auth/guest", async (route) => {
              if (fail)
                await route.fulfill({
                  status: 503,
                  contentType: "application/json",
                  body: JSON.stringify({
                    error: { code: "SERVICE_UNAVAILABLE" },
                  }),
                });
              else await route.continue();
            });
            await page.reload();
            await expect(page.locator("#account-error")).toBeVisible();
            await expect(page.locator("#account-new-guest")).toBeHidden();
            fail = false;
            await page.locator("#account-reload").click();
            await expect(page.locator("#account-error")).toBeHidden();
            const after = await context.request.get(
              fixture.origin + "/api/v1/me",
            );
            assert.equal((await after.json()).player_id, before);
            assert.equal(
              (await fixture.db.pool.query("SELECT count(*) AS n FROM players"))
                .rows[0].n,
              "1",
            );
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

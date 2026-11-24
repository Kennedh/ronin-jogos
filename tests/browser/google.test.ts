import { test } from "node:test";
import { existsSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
import { portalFixture } from "../helpers/portal.ts";
import { syntheticGoogle } from "../helpers/google.ts";

test(
  "Ronin ID Google button on the real build starts and reauthenticates a Google-only session",
  { timeout: 120000 },
  async () => {
    let now = Date.now();
    const google = await syntheticGoogle(() => now);
    const fixture = await portalFixture(
      undefined,
      () => new Date(now),
      Buffer.alloc(32, 19),
      google.config,
    );
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
    const browser = await chromium.launch(
      existsSync(chrome) ? { executablePath: chrome } : {},
    );
    try {
      const page = await browser.newPage();
      await page.exposeFunction("makeFixtureCredential", (nonce: string) =>
        google.sign(nonce, "google-browser"),
      );
      await page.route("https://accounts.google.com/gsi/client", (route) =>
        route.fulfill({
          contentType: "text/javascript",
          body: `window.google = {accounts:{id:{
        initialize(config){ window.fixtureGoogle = config; },
        renderButton(slot){ const button=document.createElement("button"); button.textContent="Synthetic Google chooser"; button.type="button";
        button.onclick=async()=>{ const config=window.fixtureGoogle;config.callback({credential:await window.makeFixtureCredential(config.nonce)}); };slot.append(button);}
      }}};`,
        }),
      );
      await page.goto(fixture.origin + "/account/en");
      await expect(page.locator("#account-google-signin")).toBeVisible();
      await expect(
        page.locator('script[src="https://accounts.google.com/gsi/client"]'),
      ).toHaveCount(0);
      await page.locator("#account-google-signin").click();
      await page
        .getByRole("button", { name: "Synthetic Google chooser" })
        .click();
      await expect(page.locator("#account-message")).toHaveText(
        "Signed in with Google.",
      );
      await expect(page.locator("#account-state")).toHaveText(
        "Google account linked",
      );
      await expect(page.locator("#account-google-unlink")).toBeHidden();
      await expect(page.locator("#account-register-title")).toHaveText(
        "Add email and password",
      );
      await expect(page.locator("#account-email-login-panel")).toBeHidden();
      now += 601_000;
      await page.locator("#account-sessions-refresh").click();
      await expect(page.locator("#account-reauth-form")).toBeHidden();
      await page.locator("#account-google-reauth").click();
      await page
        .getByRole("button", { name: "Synthetic Google chooser" })
        .click();
      await expect(page.locator("#account-message")).toHaveText(
        "Google account confirmed.",
      );
      await expect(page.locator("#account-sessions")).toContainText(
        "This session",
      );
      await page.locator("#account-logout").click();
      await expect(page.locator("#account-google-signin")).toBeVisible();
      await page.locator("#account-google-signin").click();
      await page
        .getByRole("button", { name: "Synthetic Google chooser" })
        .click();
      await expect(page.locator("#account-state")).toHaveText(
        "Google account linked",
      );
      await page.goto(fixture.origin + "/account/pt-br");
      await expect(page.locator("#account-state")).toHaveText(
        "Conta Google vinculada",
      );
      await expect(page.locator("#account-register-title")).toHaveText(
        "Adicionar e-mail e senha",
      );
    } finally {
      await browser.close();
      await fixture.close();
    }
  },
);

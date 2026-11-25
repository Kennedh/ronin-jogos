import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
import { deliverAuthMail, Privacy } from "@ronin/data";
import { portalFixture } from "../helpers/portal.ts";

test(
  "Ronin ID EN downloads account data and recovers a pending deletion",
  { timeout: 120000 },
  async () => {
    let now = Date.now();
    const clock = () => new Date(now),
      key = Buffer.alloc(32, 41);
    const fixture = await portalFixture(undefined, clock, key);
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
    const browser = await chromium.launch(
      existsSync(chrome) ? { executablePath: chrome } : {},
    );
    try {
      const page = await browser.newPage({
        locale: "en-US",
        viewport: { width: 390, height: 844 },
        acceptDownloads: true,
      });
      const email = "privacy-browser@example.test",
        password = "privacy browser passphrase";
      await page.goto(fixture.origin + "/account/en");
      await page.locator("#register-email").fill(email);
      await page.locator("#register-nickname").fill("Privacy Browser");
      await page.locator("#register-password").fill(password);
      await page.locator("#account-register-form button").click();
      await expect(page.locator("#account-state")).toHaveText(
        "Email confirmation pending",
      );
      let link = "";
      await deliverAuthMail(
        fixture.db.pool,
        key,
        {
          async send(_id, mail) {
            link = mail.link;
          },
        },
        clock,
      );
      await page.goto(link);
      await page.locator("#account-verify").click();
      await expect(page.locator("#account-state")).toHaveText(
        "Email confirmed",
      );
      const {
        rows: [registered],
      } = await fixture.db.pool.query(
        "SELECT player_id FROM email_accounts WHERE email=$1",
        [email],
      );
      const privacy = new Privacy(fixture.db.pool, clock);
      await privacy.moderateNickname(registered.player_id, { hide: "OTHER" });
      await page.reload();
      await expect(page.locator("#account-nickname-notice")).toContainText(
        "Your nickname is hidden",
      );
      await page.locator("#account-nickname-appeal").click();
      await expect(page.locator("#account-message")).toHaveText(
        "Nickname review requested.",
      );
      assert.equal((await privacy.moderationQueue()).length, 1);
      assert.equal(
        (await privacy.inspectNickname(registered.player_id)).nickname,
        "Privacy Browser",
      );
      await privacy.moderateNickname(registered.player_id, {
        resolve: "RESTORED",
      });
      await page.reload();
      await expect(page.locator("#account-nickname-notice")).toContainText(
        "Your nickname was restored.",
      );

      now += 601_000;
      await page.locator("#account-export").click();
      await expect(page.locator("#account-error")).toContainText(
        "Confirm your identity",
      );
      await page.locator("#reauth-password").fill(password);
      await page.locator("#account-reauth-form button").click();
      await expect(page.locator("#account-message")).toHaveText(
        "Password confirmed.",
      );
      const dataFile = page.waitForEvent("download");
      await page.locator("#account-export").click();
      const download = await dataFile;
      assert.equal(download.suggestedFilename(), "ronin-id-data.json");
      const stream = await download.createReadStream();
      assert.ok(stream);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(Buffer.from(chunk));
      const downloaded = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      assert.equal(downloaded.profile.email, email);
      assert.equal(downloaded.sessions.length, 1);
      assert.ok(!JSON.stringify(downloaded).includes("csrf_digest"));
      await page.locator("#account-delete-details summary").click();
      await expect(page.locator("#account-delete-submit")).toBeDisabled();
      await page.locator("#account-delete-agree").check();
      await page.locator("#account-delete-submit").click();
      await expect(page.locator("#account-state")).toHaveText(
        "Account deletion pending",
      );
      await page.reload();
      await expect(page.locator("#account-deletion-status")).toContainText(
        "You can cancel before",
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.locator("#account-delete-cancel").click();
      await expect(page.locator("#account-message")).toHaveText(
        "Account deletion cancelled.",
      );
      await expect(page.locator("#account-state")).toHaveText(
        "Email confirmed",
      );
    } finally {
      await browser.close();
      await fixture.close();
    }
  },
);

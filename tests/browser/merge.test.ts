import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
import { deliverAuthMail } from "@ronin/data";
import { portalFixture } from "../helpers/portal.ts";

test(
  "Ronin ID PT compares both profiles, requires explicit confirmation and restores the destination",
  { timeout: 120000 },
  async () => {
    const key = Buffer.alloc(32, 83);
    const fixture = await portalFixture(undefined, undefined, key);
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
    const browser = await chromium.launch(
      existsSync(chrome) ? { executablePath: chrome } : {},
    );
    try {
      const local = await browser.newPage({ locale: "pt-BR" });
      const email = "merge-browser@example.test",
        password = "merge browser synthetic passphrase";
      const account = fixture.origin + "/account/pt-br";
      await local.goto(account);
      await local.locator("#register-email").fill(email);
      await local.locator("#register-nickname").fill("Destino Browser");
      await local.locator("#register-password").fill(password);
      await local.locator("#account-register-form button").click();
      await expect(local.locator("#account-state")).toHaveText(
        "Confirmação de e-mail pendente",
      );
      let link = "";
      await deliverAuthMail(fixture.db.pool, key, {
        async send(_id, mail) {
          link = mail.link;
        },
      });
      assert.ok(link);
      await local.goto(link);
      await local.locator("#account-verify").click();
      await expect(local.locator("#account-state")).toHaveText(
        "E-mail confirmado",
      );

      const guest = await browser.newPage({
        locale: "pt-BR",
        viewport: { width: 390, height: 844 },
      });
      await guest.goto(account);
      await guest
        .locator("#account-profile-nickname")
        .fill("Visitante Browser");
      await guest.locator("#account-profile-form button").click();
      await expect(guest.locator("#account-name")).toHaveText(
        "Visitante Browser",
      );
      const archived = await guest.evaluate(async () => {
        const init = {
          method: "POST",
          headers: { "content-type": "application/json" },
        };
        const session = await fetch("/api/v1/auth/guest", {
          ...init,
          body: "{}",
        });
        const csrf = session.headers.get("x-csrf-token")!;
        const response = await fetch("/api/v1/runs/start", {
          ...init,
          headers: {
            ...init.headers,
            "x-csrf-token": csrf,
            "idempotency-key": crypto.randomUUID(),
          },
          body: JSON.stringify({ mode: "FULL" }),
        });
        if (response.status !== 201)
          throw new Error("fixture run could not start");
        return (await response.json()).run_id as string;
      });
      await fixture.db.pool.query(
        "UPDATE runs SET status='ABANDONED' WHERE id=$1",
        [archived],
      );

      await guest.locator("#login-email").fill(email);
      await guest.locator("#login-password").fill(password);
      await guest.locator("#account-login-form button").click();
      await expect(guest.locator("#account-error")).toContainText(
        "compare os perfis",
      );
      await guest.locator("#merge-email").fill(email);
      await guest.locator("#merge-password").fill(password);
      await guest.locator("#account-merge-proof-form button").click();
      await expect(guest.locator("#account-merge-comparison")).toContainText(
        "Visitante Browser",
      );
      await expect(guest.locator("#account-merge-comparison")).toContainText(
        "Destino Browser",
      );
      await expect(guest.locator("#account-merge-confirm")).toBeDisabled();
      assert.equal(
        await guest.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await guest.locator("#account-merge-cancel").click();
      await expect(guest.locator("#account-merge-panel")).toBeHidden();
      await expect(guest.locator("#account-name")).toHaveText(
        "Visitante Browser",
      );
      await guest.locator("#account-merge-open").click();
      await guest.locator("#merge-email").fill(email);
      await guest.locator("#merge-password").fill(password);
      await guest.locator("#account-merge-proof-form button").click();
      await guest.locator("#account-merge-agree").check();
      await guest.locator("#account-merge-confirm").click();
      await expect(guest.locator("#account-message")).toHaveText(
        "Seu progresso de visitante foi transferido para este Ronin ID.",
      );
      await expect(guest.locator("#account-name")).toHaveText(
        "Destino Browser",
      );
      const run = await guest.request.get(
        fixture.origin + "/api/v1/runs/" + archived,
      );
      assert.equal(run.status(), 200);
      assert.equal((await run.json()).status, "ABANDONED");
      await guest.reload();
      await expect(guest.locator("#account-name")).toHaveText(
        "Destino Browser",
      );
    } finally {
      await browser.close();
      await fixture.close();
    }
  },
);

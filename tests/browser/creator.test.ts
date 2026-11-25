import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { portalFixture } from "../helpers/portal.ts";
import { BOSS_MANIFEST } from "@ronin/content/runner-manifest";

test(
  "6A: guest tries locked items, resolves a two-tab conflict and wears the saved look in Phaser",
  { timeout: 120000 },
  async () => {
    const site = await portalFixture(BOSS_MANIFEST);
    const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
    const browser = await chromium.launch(
      existsSync(chrome) ? { executablePath: chrome } : {},
    );
    try {
      await site.reset();
      const context = await browser.newContext({
        viewport: { width: 1250, height: 900 },
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(site.origin + "/roninrunner/pt-br");
      await expect(page.locator("#play")).toBeEnabled();
      await page.locator("#open-creator").click();
      const slot = (id: string) => page.locator("#creator-" + id);
      await expect(slot("body_palette")).toBeEnabled();
      await slot("slash_effect_id").selectOption("trail_aurora");
      await expect(slot("requirement")).toContainText("quatro selos");
      await expect(slot("save")).toBeDisabled();
      await page.locator("#rig-animation").selectOption("PERFECT");
      await slot("slash_effect_id").selectOption("trail_ink");
      await slot("body_palette").selectOption("skin_umber");
      await slot("hair_style").selectOption("hair_ponytail");
      await slot("face_detail").selectOption("face_paint");
      await slot("outfit_id").selectOption("robe_clay");
      await slot("head_accessory_id").selectOption("head_band");
      await slot("katana_visual_id").selectOption("sword_jade");
      await page.route("**/api/v1/me/character", (route) => route.abort());
      await slot("save").click();
      await expect(slot("save")).toBeEnabled();
      await expect(slot("outfit_id")).toHaveValue("robe_clay");
      await page.unroute("**/api/v1/me/character");
      await slot("save").click();
      await expect(slot("status")).toHaveText("Visual salvo.");
      const mobile = await context.newPage();
      await mobile.setViewportSize({ width: 390, height: 844 });
      await mobile.goto(site.origin + "/roninrunner/en#rig-lab");
      await expect(mobile.locator("#creator-outfit_id")).toHaveValue(
        "robe_clay",
      );
      await expect(mobile.getByLabel("Hairstyle", { exact: true })).toHaveValue(
        "hair_ponytail",
      );
      assert.equal(
        await mobile.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await mobile.locator("#creator-hair_color").selectOption("dye_ash");
      await mobile.locator("#creator-save").click();
      await expect(mobile.locator("#creator-status")).toHaveText("Look saved.");
      await mkdir("artifacts/phase-6a", { recursive: true });
      await mobile
        .locator("#rig-lab")
        .screenshot({ path: "artifacts/phase-6a/creator-mobile-en.png" });
      await mobile.goto(site.origin + "/account/en");
      await expect(mobile.locator("#account-avatar figcaption")).toContainText(
        "Wandering Ronin · clay",
      );
      await mobile.close();
      await slot("hair_style").selectOption("hair_bun");
      await slot("save").click();
      await expect(slot("status")).toContainText("outra sessão");
      await expect(slot("hair_style")).toHaveValue("hair_bun");
      await slot("reload").click();
      await expect(slot("hair_color")).toHaveValue("dye_ash");
      await expect(slot("hair_style")).toHaveValue("hair_ponytail");
      await page.locator("#rig-animation").selectOption("RUN");
      await mkdir("artifacts/phase-6a", { recursive: true });
      await page
        .locator("#rig-lab")
        .screenshot({ path: "artifacts/phase-6a/creator-pt.png" });
      await page.locator("#rig-lab summary").click();
      await page.locator("#play").click();
      await expect(page.locator("#surface")).toHaveAttribute(
        "data-phase",
        "running",
      );
      // Read the actual robe pigment from the player area in the live Phaser canvas.
      await expect
        .poll(() =>
          page.locator("#surface canvas").evaluate((el) => {
            const c = el as HTMLCanvasElement,
              ctx = c.getContext("2d")!;
            const pixels = ctx.getImageData(240, 0, 180, c.height).data;
            let count = 0;
            for (let i = 0; i < pixels.length; i += 4)
              if (
                pixels[i] === 150 &&
                pixels[i + 1] === 92 &&
                pixels[i + 2] === 74
              )
                count++;
            return count;
          }),
        )
        .toBeGreaterThan(20);
      assert.deepEqual(errors, []);
      await context.close();
    } finally {
      await browser.close();
      await site.close();
    }
  },
);

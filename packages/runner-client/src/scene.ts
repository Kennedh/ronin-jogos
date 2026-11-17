import Phaser from "phaser";
import { RULES_V1 } from "@ronin/runner-core";
import type { Rules } from "@ronin/runner-core";
import type { RunSession } from "./session.ts";
export interface SceneOptions {
  session: () => RunSession | undefined;
  frame: (time: number) => void;
  reducedMotion: () => boolean;
}
/** Original vector rig; geometry and score remain exclusively in the shared core. */
export function mountRunner(parent: HTMLElement, options: SceneOptions) {
  let readyResolve: () => void = () => {},
    readyReject: (error: Error) => void = () => {};
  const ready = new Promise<void>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  class BambooScene extends Phaser.Scene {
    private ground = 548;
    private viewHeight = 720;
    private backdrop!: Phaser.GameObjects.Graphics;
    private forest!: Phaser.GameObjects.Graphics;
    private foreground!: Phaser.GameObjects.Graphics;
    constructor() {
      super({ key: "bamboo-runner" });
    }
    create() {
      this.backdrop = this.add.graphics();
      this.forest = this.add.graphics();
      this.foreground = this.add.graphics();
      this.background();
      this.draw();
      readyResolve();
    }
    override update() {
      options.frame(performance.now());
      this.draw();
    }
    resizeView(height: number) {
      this.viewHeight = height;
      this.ground = Math.min(548, height - 90);
      if (!this.backdrop) return;
      this.backdrop.clear();
      this.background();
      this.draw();
    }
    private background() {
      const g = this.backdrop;
      g.fillStyle(0xf2e7ce);
      g.fillRect(0, 0, 1280, this.viewHeight);
      for (let i = 0; i < 30; i++) {
        g.fillStyle(0xd7ddc8, 0.018 + i * 0.001);
        g.fillRect(0, Math.max(0, this.ground - 368) + i * 12, 1280, 12);
      }
      g.fillStyle(0xb74c47, 0.76);
      g.fillCircle(
        967,
        Math.max(98, this.ground - 382),
        this.viewHeight < 500 ? 75 : 99,
      );
      g.lineStyle(1, 0x2a2528, 0.065);
      for (let i = 0; i < 80; i++) {
        const x = (i * 157) % 1280,
          y = (i * 73) % this.viewHeight;
        g.lineBetween(x, y, x + 40 + (i % 30), y + 1);
      }
      g.fillStyle(0x6b8768, 0.12);
      g.fillPoints(
        [
          { x: 0, y: 365 },
          { x: 260, y: 270 },
          { x: 500, y: 350 },
          { x: 740, y: 290 },
          { x: 1050, y: 360 },
          { x: 1280, y: 290 },
          { x: 1280, y: 565 },
          { x: 0, y: 565 },
        ].map((p) => new Phaser.Math.Vector2(p.x, p.y + this.ground - 548)),
        true,
      );
      g.fillStyle(0x6b8768, 0.13);
      g.fillPoints(
        [
          { x: 0, y: 430 },
          { x: 310, y: 360 },
          { x: 610, y: 430 },
          { x: 900, y: 370 },
          { x: 1280, y: 440 },
          { x: 1280, y: 570 },
          { x: 0, y: 570 },
        ].map((p) => new Phaser.Math.Vector2(p.x, p.y + this.ground - 548)),
        true,
      );
      g.lineStyle(1, 0x2a2528, 0.09);
      g.lineBetween(50, this.viewHeight - 45, 1230, this.viewHeight - 45);
    }
    private bamboo(
      x: number,
      y: number,
      height: number,
      width: number,
      color: number,
      alpha: number,
    ) {
      const g = this.forest;
      g.fillStyle(color, alpha);
      g.fillRect(x, y - height, width, height);
      for (let h = height - 45; h > 20; h -= 62) {
        g.lineStyle(2, 0xf2e7ce, alpha * 0.7);
        g.lineBetween(x - 2, y - h, x + width + 2, y - h);
        g.lineStyle(2, color, alpha);
        const side = h % 3 ? 1 : -1;
        g.lineBetween(x + width / 2, y - h, x + side * 55, y - h - 24);
        for (let j = 0; j < 4; j++) {
          const bx = x + side * (22 + j * 9),
            by = y - h - 12 - j * 3;
          g.fillStyle(color, alpha);
          g.fillTriangle(
            bx,
            by,
            bx + side * 20,
            by - 14,
            bx + side * 13,
            by + 4,
          );
        }
      }
    }
    private ronin(
      x: number,
      feet: number,
      tick: number,
      slide: boolean,
      attackAge: number,
      hurt: boolean,
      rules: Rules,
    ) {
      const g = this.foreground,
        sx =
          (slide ? rules.slideWidth : rules.bodyWidth) /
          rules.scale /
          (slide ? 54 : 44),
        sy =
          (slide ? rules.slideHeight : rules.bodyHeight) /
          rules.scale /
          (slide ? 44 : 88);
      g.save();
      g.translateCanvas(x, feet);
      g.scaleCanvas(sx, sy);
      x = 0;
      feet = 0;
      const reach = rules.swordReach / rules.scale / sx;
      const motion = options.reducedMotion() ? 0 : Math.sin(tick * 0.33),
        top = slide ? feet - 44 : feet - 88;
      g.lineStyle(6, 0x2a2528);
      g.lineBetween(x - 10, feet - 22, x - 18 - motion * 8, feet - 2);
      g.lineBetween(x + 8, feet - 22, x + 14 + motion * 8, feet - 2);
      g.fillStyle(0x2a2528);
      g.fillTriangle(x - 15, top + 25, x + 12, top + 23, x + 25, feet - 18);
      g.fillTriangle(x - 15, top + 25, x - 23, feet - 18, x + 25, feet - 18);
      g.fillStyle(0xa64340);
      g.fillTriangle(
        x - 16,
        top + 28,
        x - 52 - motion * 6,
        top + 19,
        x - 30,
        top + 37,
      );
      g.fillRect(x - 16, top + 24, 30, 7);
      g.fillStyle(0xb99763);
      g.fillCircle(x + 2, top + 15, 10);
      g.fillStyle(0x2a2528);
      g.fillTriangle(x - 30, top + 9, x + 3, top - 9, x + 33, top + 11);
      g.lineStyle(2, 0x2a2528);
      g.lineBetween(x - 30, top + 11, x + 32, top + 13);
      g.lineStyle(5, 0x2a2528);
      g.lineBetween(x + 3, top + 32, x + 21, top + 49);
      const active =
        attackAge >= rules.attackWindup &&
        attackAge < rules.attackWindup + rules.attackActive;
      if (active) {
        g.lineStyle(5, 0xa64340, 0.8);
        g.beginPath();
        g.arc(x + 22, top + 47, reach, -0.65, 0.55);
        g.strokePath();
        g.lineStyle(2, 0xf2e7ce);
        g.lineBetween(x + 21, top + 49, x + 22 + reach, top + 20);
      } else {
        g.lineStyle(3, 0x6b8768);
        g.lineBetween(x + 21, top + 49, x + 61, top + 11);
      }
      if (hurt) {
        g.lineStyle(2, 0xb74c47, 0.85);
        g.strokeCircle(x, top + 45, 52);
      }
      g.restore();
    }
    private draw() {
      const session = options.session(),
        state = session?.state,
        rules = session?.manifest.physics ?? RULES_V1,
        scale = rules.scale,
        distance = (state?.distance ?? 0) / scale,
        tick = state?.tick ?? 0;
      const f = this.forest;
      f.clear();
      for (let i = -1; i < 12; i++) {
        const x =
          i * 145 - ((options.reducedMotion() ? 0 : distance * 0.18) % 145);
        this.bamboo(
          x,
          this.ground,
          300 + ((i * 59 + 600) % 160),
          9,
          0x6b8768,
          0.22,
        );
      }
      for (let i = -1; i < 9; i++) {
        const x =
          i * 200 +
          62 -
          ((options.reducedMotion() ? 0 : distance * 0.33) % 200);
        this.bamboo(
          x,
          this.ground,
          360 + ((i * 71 + 600) % 170),
          13,
          0x486343,
          0.34,
        );
      }
      const g = this.foreground;
      g.clear();
      g.fillStyle(0x2a2528);
      g.fillRect(0, this.ground, 1280, 12);
      g.fillStyle(0x6b8768, 0.14);
      g.fillRect(0, this.ground + 12, 1280, 60);
      if (session) {
        for (const gap of session.world.gaps) {
          const x = 324 + (gap.start - state!.distance) / scale,
            w = (gap.end - gap.start) / scale;
          if (x + w < 0 || x > 1280) continue;
          g.fillStyle(0x272d27);
          g.fillRect(x, this.ground, w, 105);
          g.fillStyle(0xf2e7ce, 0.35);
          g.fillTriangle(
            x,
            this.ground + 104,
            x + w * 0.6,
            this.ground + 122,
            x + w,
            this.ground + 104,
          );
          g.lineStyle(2, 0xa64340, 0.8);
          g.lineBetween(x - 8, this.ground - 2, x, this.ground - 14);
          g.lineBetween(x + w, this.ground - 14, x + w + 8, this.ground - 2);
        }
        const resolved = new Set(state!.resolved.map((e) => e.id));
        for (const e of session.world.entities) {
          if (resolved.has(e.id)) continue;
          const x = 324 + (e.x - state!.distance) / scale,
            w = e.width / scale,
            top = this.ground + e.top / scale,
            h = (e.bottom - e.top) / scale;
          if (x + w < 0 || x > 1280) continue;
          if (e.kind === "OBSTACLE") {
            g.fillStyle(0x2a2528);
            g.fillRect(x, top, w, h);
            g.lineStyle(2, 0xb99763, 0.8);
            g.lineBetween(x + 8, top + 9, x + w - 9, top + 7);
            g.lineBetween(x + 9, top + 16, x + 12, this.ground);
          } else {
            g.fillStyle(0x2a2528);
            g.fillCircle(x + w / 2, top + 12, 11);
            g.fillTriangle(
              x + 6,
              this.ground,
              x + w / 2,
              top + 22,
              x + w - 4,
              this.ground,
            );
            g.lineStyle(4, 0x2a2528);
            g.lineBetween(x + 5, top + 34, x + w + 5, top + 40);
            g.lineStyle(2, 0xa64340);
            g.lineBetween(x + w / 2 - 8, top + 12, x + w / 2 + 8, top + 12);
          }
        }
      }
      const slide =
        !!state && state.slideUntil > 0 && state.tick <= state.slideUntil;
      this.ronin(
        324,
        this.ground + (state?.y ?? 0) / scale,
        tick,
        slide,
        (state?.attackAge ?? -1) - 1,
        !!state && state.tick < state.invulnerableUntil,
        rules,
      );
      // Foreground brush accents are cosmetic and never enter the world RNG.
      g.lineStyle(1, 0x2a2528, 0.3);
      for (let i = 0; i < 28; i++) {
        const x = (i * 97 - distance * 0.8) % 1360;
        g.lineBetween(x, this.ground + 12, x + 22, this.ground + 15);
      }
    }
  }
  const scene = new BambooScene();
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    width: 1280,
    height: 720,
    parent,
    backgroundColor: "#f2e7ce",
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [scene],
  });
  const timeout = setTimeout(
    () => readyReject(new Error("renderer_boot_timeout")),
    12000,
  );
  void ready.then(
    () => clearTimeout(timeout),
    () => clearTimeout(timeout),
  );
  return {
    ready,
    resize() {
      const bounds = parent.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const height = Math.round(
        Math.min(720, Math.max(360, (1280 * bounds.height) / bounds.width)),
      );
      game.scale.setGameSize(1280, height);
      scene.resizeView(height);
      game.scale.refresh();
    },
    destroy() {
      clearTimeout(timeout);
      game.destroy(true);
    },
  };
}

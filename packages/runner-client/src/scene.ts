import Phaser from "phaser";
import { biomeTheme, paintBackdrop, paintProps, paintEnemy } from "./biomes.ts";
import type { Theme } from "./biomes.ts";
import { drawRig, poseFor } from "./rig.ts";
import { RULES_V1 } from "@ronin/runner-core";
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
  class RunnerScene extends Phaser.Scene {
    private ground = 548;
    private theme: Theme = biomeTheme("BAMBOO", 0);
    private themeKey = "BAMBOO:0";
    private previousTheme: Theme | undefined;
    private transitionDistance = 0;
    private fadeBackdrop!: Phaser.GameObjects.Graphics;
    private viewHeight = 720;
    private backdrop!: Phaser.GameObjects.Graphics;
    private forest!: Phaser.GameObjects.Graphics;
    private foreground!: Phaser.GameObjects.Graphics;
    constructor() {
      super({ key: "ronin-runner-world" });
    }
    create() {
      this.backdrop = this.add.graphics();
      this.fadeBackdrop = this.add.graphics();
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
      paintBackdrop(this.backdrop, this.viewHeight, this.ground, this.theme);
      if (this.previousTheme)
        paintBackdrop(
          this.fadeBackdrop,
          this.viewHeight,
          this.ground,
          this.previousTheme,
        );
      else this.fadeBackdrop.clear();
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
    private draw() {
      const session = options.session(),
        state = session?.state,
        rules = session?.manifest.physics ?? RULES_V1,
        scale = rules.scale,
        distance = (state?.distance ?? 0) / scale,
        tick = state?.tick ?? 0;
      const journey = state?.journey,
        key = `${journey?.region ?? "BAMBOO"}:${journey?.corruption ?? 0}`;
      if (key !== this.themeKey) {
        this.previousTheme = journey ? this.theme : undefined;
        this.transitionDistance = state?.distance ?? 0;
        this.themeKey = key;
        this.theme = biomeTheme(
          journey?.region ?? "BAMBOO",
          journey?.corruption ?? 0,
        );
        this.background();
      }
      const blend = options.reducedMotion()
        ? 1
        : Math.min(
            1,
            Math.max(
              0,
              ((state?.distance ?? 0) - this.transitionDistance) / 240000,
            ),
          );
      this.fadeBackdrop.setAlpha(this.previousTheme ? 1 - blend : 0);
      parent.dataset["region"] = journey?.region ?? "BAMBOO";
      parent.dataset["cycle"] = String(journey?.cycle ?? 1);
      parent.dataset["speed"] = String(journey?.speed ?? rules.speed);
      const world = session?.renderWorld;
      const f = this.forest;
      f.clear();
      if (this.theme.region === "BAMBOO") {
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
      }
      paintProps(
        f,
        distance,
        tick,
        this.ground,
        this.theme,
        options.reducedMotion(),
      );
      const g = this.foreground;
      g.clear();
      g.fillStyle(0x2a2528);
      g.fillRect(0, this.ground, 1280, 12);
      g.fillStyle(0x6b8768, 0.14);
      g.fillRect(0, this.ground + 12, 1280, 60);
      if (session) {
        for (const gap of world!.gaps) {
          const x = 324 + (gap.start - state!.distance) / scale,
            w = (gap.end - gap.start) / scale;
          if (x + w < 0 || x > 1280) continue;
          g.fillStyle(0x272d27);
          g.fillRect(x, this.ground, w, this.viewHeight - this.ground + 40);
          g.fillStyle(this.theme.ink, 0.45);
          g.fillRect(
            x,
            this.ground,
            Math.min(10, w / 8),
            this.viewHeight - this.ground + 40,
          );
          g.fillRect(
            x + w - Math.min(10, w / 8),
            this.ground,
            Math.min(10, w / 8),
            this.viewHeight - this.ground + 40,
          );
          g.lineStyle(2, 0xa64340, 0.8);
          g.lineBetween(x - 8, this.ground - 2, x, this.ground - 14);
          g.lineBetween(x + w, this.ground - 14, x + w + 8, this.ground - 2);
        }
        const resolved = new Set(state!.resolved.map((e) => e.id));
        for (const e of world!.entities) {
          if (resolved.has(e.id) || e.hidden) continue;
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
            if (
              e.idealTick !== undefined &&
              Math.abs(tick - e.idealTick) <= rules.perfectTicks
            ) {
              g.lineStyle(2, this.theme.accent);
              g.strokeCircle(x + w / 2, top - 12, 10);
            }
            paintEnemy(
              g,
              e,
              x,
              this.ground,
              scale,
              this.theme,
              world!.entities.find((v) => v.hidden && v.damageOwner === e.id),
            );
          }
        }
      }
      g.save();
      g.translateCanvas(324, this.ground + (state?.y ?? 0) / scale);
      const pose = poseFor(state, rules, session?.recentEvents ?? []);
      parent.dataset["pose"] = pose.locomotion;
      parent.dataset["action"] = pose.action;
      drawRig(
        {
          line(points, color, width, alpha = 1) {
            g.lineStyle(width, color, alpha);
            g.beginPath();
            points.forEach(([x, y], i) =>
              i ? g.lineTo(x, y) : g.moveTo(x, y),
            );
            g.strokePath();
          },
          polygon(points, color, alpha = 1) {
            g.fillStyle(color, alpha);
            g.fillPoints(
              points.map(([x, y]) => new Phaser.Math.Vector2(x, y)),
              true,
            );
          },
          circle(x, y, r, color, alpha = 1) {
            g.fillStyle(color, alpha);
            g.fillCircle(x, y, r);
          },
        },
        pose,
        rules,
        options.reducedMotion(),
      );
      g.restore();
      // Foreground brush accents are cosmetic and never enter the world RNG.
      g.lineStyle(1, 0x2a2528, 0.3);
      for (let i = 0; i < 28; i++) {
        const x = (i * 97 - distance * 0.8) % 1360;
        if (
          !world?.gaps.some((gap) => {
            const left = 324 + (gap.start - (state?.distance ?? 0)) / scale;
            return x + 22 > left && x < left + (gap.end - gap.start) / scale;
          })
        )
          g.lineBetween(x, this.ground + 12, x + 22, this.ground + 15);
      }
    }
  }
  const scene = new RunnerScene();
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

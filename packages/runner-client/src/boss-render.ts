import type Phaser from "phaser";
import { bossView } from "@ronin/runner-core";
import type { SimState, Rules } from "@ronin/runner-core";
import type { Theme } from "./biomes.ts";
/** Original vector studies; vulnerability/attack locations come from the authoritative core. */
export function paintBoss(
  g: Phaser.GameObjects.Graphics,
  s: SimState,
  r: Rules,
  ground: number,
  t: Theme,
  reduced: boolean,
) {
  const v = bossView(s, r);
  if (!v || ["SCHEDULED", "COMPLETED"].includes(v.phase)) return;
  const fade = v.phase === "WARNING" ? 0.2 : v.phase === "EXITING" ? 0.25 : 1;
  const defeated = v.result === "DEFEATED",
    ink = defeated ? t.wash : t.ink,
    x = v.phase === "WARNING" ? 960 : v.lunge && v.attacking ? 550 : 760;
  const sway = reduced ? 0 : Math.floor(Math.sin(s.tick / 12) * 5),
    y = ground + sway;
  g.fillStyle(ink, 0.85 * fade);
  g.lineStyle(6, ink, fade);
  if (v.profile.id === "B01") {
    g.fillEllipse(x, y - 130, 155, 230);
    for (let i = 0; i < 5; i++)
      g.lineBetween(x - 40 + i * 22, y - 90, 420 + i * 50, ground);
    for (let i = 0; i < 6; i++) {
      g.lineBetween(x - 25 + i * 10, y - 150, x - 130 + i * 45, y - 280);
      g.fillTriangle(
        x - 130 + i * 45,
        y - 280,
        x - 100 + i * 45,
        y - 255,
        x - 90 + i * 45,
        y - 300,
      );
    }
  } else if (v.profile.id === "B02") {
    g.fillRect(x - 65, y - 200, 130, 200);
    g.fillStyle(t.accent, 0.65 * fade);
    g.fillEllipse(x, y - 190, 150, 140);
    g.lineStyle(4, ink, fade);
    g.strokeEllipse(x, y - 190, 150, 140);
    g.lineBetween(x - 80, y - 135, x + 80, y - 135);
    g.fillRect(x - 90, y - 90, 180, 18);
  } else if (v.profile.id === "B03") {
    for (let i = 0; i < 5; i++) {
      g.fillStyle(ink, fade * (0.7 - i * 0.1));
      g.fillEllipse(x + i * 18, y - 180 - i * 20, 170 + i * 18, 80);
    }
    g.lineStyle(4, t.accent, fade);
    for (let i = 0; i < 4; i++)
      g.lineBetween(x - 80, y - 180 + i * 22, x + 70, y - 210 + i * 22);
  } else {
    g.fillTriangle(x, y - 240, x - 100, y, x + 95, y);
    g.fillCircle(x, y - 210, 32);
    g.lineStyle(8, t.accent, fade);
    g.lineBetween(x - 30, y - 180, x - 130, y - 290);
    g.lineBetween(x + 20, y - 160, x + 135, y - 230);
  }
  const highY = ground - 105,
    lowY = ground - 22;
  if (v.attacking) {
    g.fillStyle(t.accent, 0.3);
    g.fillRect(294, ground + (v.high ? -150 : -42), 60, v.high ? 95 : 42);
  }
  if (v.telegraph || v.attacking) {
    const cy = v.high ? highY : lowY;
    g.lineStyle(
      v.attacking ? 12 : 3,
      v.attacking ? t.accent : ink,
      v.attacking ? 0.85 : 0.5,
    );
    g.lineBetween(294, cy, 900, cy);
    g.fillStyle(t.accent, 0.8);
    g.fillTriangle(310, cy, 330, cy - 10, 330, cy + 10);
    if (v.high) {
      g.lineStyle(6, ink, fade);
      g.lineBetween(x - 45, y - 150, 430, ground - 180);
    } else {
      g.lineStyle(6, ink, fade);
      g.lineBetween(x - 45, y - 80, 430, ground - 35);
    }
  }
  if (v.vulnerable) {
    const top = ground + (v.aerial ? -245 : -88),
      bottom = ground + (v.aerial ? -170 : 0);
    g.fillStyle(t.accent, 0.85);
    g.fillEllipse(424, (top + bottom) / 2, 80, bottom - top);
    g.lineStyle(3, t.paper);
    g.strokeEllipse(424, (top + bottom) / 2, 80, bottom - top);
    g.lineStyle(3, ink, 0.7);
    g.lineBetween(464, (top + bottom) / 2, x - 30, y - 100);
  }
  if (defeated) {
    g.lineStyle(3, t.accent, 0.6);
    for (let i = 0; i < 7; i++)
      g.lineBetween(x - 100 + i * 30, y - 20, x - 80 + i * 30, y - 110);
  }
}

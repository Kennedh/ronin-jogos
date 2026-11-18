import type Phaser from "phaser";
import type { Region, Entity } from "@ronin/runner-core";
type G = Phaser.GameObjects.Graphics;
export interface Theme {
  paper: number;
  wash: number;
  sun: number;
  ink: number;
  accent: number;
  region: Region;
  corruption: number;
}
export function biomeTheme(region: Region, corruption: number): Theme {
  const tier = Math.max(0, Math.min(3, corruption));
  const palettes = {
    BAMBOO: [
      [0xf2e7ce, 0x6b8768, 0xb74c47],
      [0xe3dfc9, 0x596e60, 0xa54d46],
      [0xcbd1bf, 0x3e554c, 0x984a45],
      [0xb5c1af, 0x2e443e, 0x874543],
    ],
    TEMPLE: [
      [0xf1dfbf, 0xb99763, 0x9e6244],
      [0xe9cfb1, 0x9a7954, 0x91453c],
      [0xd2b7a3, 0x77584e, 0x873c3b],
      [0xbca99b, 0x5a4845, 0x6e343c],
    ],
    MOUNTAINS: [
      [0xe6eff0, 0x8cb2c4, 0xb59c7b],
      [0xd5e3e8, 0x7499b1, 0x9e8c7a],
      [0xb6cfdb, 0x4d7798, 0x937e73],
      [0x9bb9ca, 0x375674, 0x806f69],
    ],
    CASTLE: [
      [0xe3d6c1, 0x922f35, 0xc39f64],
      [0xd4c1ac, 0x7c3039, 0xad8750],
      [0xc3ae9d, 0x5e303a, 0x92714b],
      [0xb39f94, 0x442d36, 0x7c6245],
    ],
  } as const;
  const p = palettes[region][tier]!;
  return {
    paper: p[0],
    wash: p[1],
    sun: p[2],
    ink: 0x24292a,
    accent: region === "MOUNTAINS" ? 0x385c75 : 0x922f35,
    region,
    corruption: tier,
  };
}
export function paintBackdrop(g: G, height: number, ground: number, t: Theme) {
  g.clear();
  g.fillStyle(t.paper);
  g.fillRect(0, 0, 1280, height);
  for (let i = 0; i < 25; i++) {
    g.fillStyle(t.wash, 0.015 + i * 0.0015);
    g.fillRect(0, Math.max(0, ground - 360) + i * 16, 1280, 16);
  }
  g.fillStyle(t.sun, 0.7);
  g.fillCircle(967, Math.max(95, ground - 350), height < 500 ? 75 : 99);
  if (t.region === "CASTLE") {
    g.fillStyle(t.ink, 0.85);
    g.fillCircle(981, Math.max(87, ground - 358), height < 500 ? 65 : 85);
  }
  for (let layer = 0; layer < 2; layer++) {
    g.fillStyle(t.wash, 0.13 + layer * 0.06);
    for (let i = 0; i < 6; i++) {
      const x = i * 270 - 80,
        peak = ground - 220 - ((i * 53) % 100) + layer * 65;
      g.fillTriangle(x, ground, x + 150, peak, x + 340, ground);
    }
  }
  g.lineStyle(1, t.ink, 0.05);
  for (let i = 0; i < 65; i++) {
    const x = (i * 157) % 1280,
      y = (i * 73) % height;
    g.lineBetween(x, y, x + 40 + (i % 20), y + 1);
  }
}
export function paintProps(
  g: G,
  distance: number,
  tick: number,
  ground: number,
  t: Theme,
  reduced: boolean,
) {
  for (let layer = 0; layer < 2; layer++)
    for (let i = -1; i < 9; i++) {
      const factor = layer ? 0.33 : 0.18,
        x = i * 210 + layer * 65 - ((reduced ? 0 : distance * factor) % 210),
        alpha = layer ? 0.45 : 0.23;
      g.fillStyle(t.wash, alpha);
      g.lineStyle(layer ? 5 : 3, t.wash, alpha);
      if (t.region === "TEMPLE") {
        const top = ground - 210 - (i % 3) * 24;
        g.fillRect(x, top, 12, ground - top);
        g.fillRect(x + 110, top, 12, ground - top);
        g.fillRect(x - 20, top - 16, 160, 12);
        g.lineBetween(x - 26, top - 26, x + 146, top - 26);
        g.fillRect(x + 6, top + 25, 110, 6);
        if (t.corruption > 1) {
          g.lineStyle(2, t.accent, 0.5);
          g.lineBetween(x + 60, top + 30, x + 60, top + 85);
          g.strokeCircle(x + 60, top + 92, 10);
        }
      } else if (t.region === "MOUNTAINS") {
        const top = ground - 260 - (i % 3) * 30;
        g.fillTriangle(x - 42, ground, x + 4, top, x + 52, ground);
        g.fillStyle(t.paper, 0.5);
        g.fillTriangle(x - 13, top + 88, x + 4, top, x + 19, top + 87);
      } else if (t.region === "CASTLE") {
        const top = ground - 200 - (i % 3) * 35;
        g.fillRect(x, top, 110, ground - top);
        for (let j = 0; j < 4; j++) g.fillRect(x + j * 30, top - 22, 17, 25);
        g.fillStyle(t.paper, 0.45);
        g.fillRect(x + 35, top + 48, 22, 40);
        g.fillStyle(t.accent, 0.65);
        g.fillTriangle(
          x + 107,
          top + 12,
          x + 170,
          top + 22,
          x + 110,
          top + 70 + t.corruption * 8,
        );
      }
    }
  if (t.region === "MOUNTAINS" || t.corruption > 1) {
    g.lineStyle(1, t.region === "MOUNTAINS" ? t.paper : t.ink, 0.5);
    for (let i = 0; i < 25 + t.corruption * 6; i++) {
      const x = (i * 137 - (reduced ? 0 : tick * (t.corruption + 1))) % 1280,
        y = (i * 47 + (reduced ? 0 : tick * 0.4)) % Math.max(1, ground);
      g.lineBetween(x, y, x + 4 + t.corruption * 2, y + 2);
    }
  }
}
export function paintEnemy(
  g: G,
  e: Entity,
  x: number,
  ground: number,
  scale: number,
  t: Theme,
  strike?: Entity,
) {
  const w = e.width / scale,
    top = ground + e.top / scale,
    h = (e.bottom - e.top) / scale,
    bottom = ground + e.bottom / scale;
  if (e.kind === "PROJECTILE") {
    g.lineStyle(2, t.ink);
    g.lineBetween(x, top + 3, x + w, top + 3);
    g.fillStyle(t.ink);
    g.fillTriangle(x, top - 1, x - 7, top + 3, x, top + 7);
    return;
  }
  if (strike) {
    const left = x + (strike.x - e.x) / scale,
      cy = ground + (strike.top + strike.bottom) / scale / 2;
    g.lineStyle(
      Math.max(2, ((strike.bottom - strike.top) / scale) * 0.25),
      t.ink,
      0.45,
    );
    g.lineBetween(left, cy, left + strike.width / scale, cy);
  }
  const kind = e.actor?.archetype ?? "E01",
    phase = e.phase ?? "APPROACH",
    cue = phase === "TELEGRAPH",
    active = phase === "ACTIVE";
  g.fillStyle(t.ink);
  g.lineStyle(3, t.ink);
  if (kind === "E03" || kind === "E09") {
    const cy = top + h / 2;
    g.fillCircle(x + w / 2, cy, w * 0.5);
    for (let i = 0; i < 7; i++)
      g.fillTriangle(
        x + (i * w) / 7,
        cy,
        x + ((i + 1) * w) / 7,
        cy,
        x + (i * w) / 7 - 9,
        cy + h * 0.5 + (i % 2) * 9,
      );
    g.lineStyle(2, t.paper);
    g.lineBetween(x + 10, cy - 5, x + w - 5, cy - 5);
  } else if (kind === "E06") {
    g.fillRect(x + 5, top + 12, w - 10, h - 20);
    g.fillTriangle(x, top + 5, x + 18, top + 12, x + 4, top + 26);
    g.fillTriangle(x + 4, top + 6, x + 8, top - 4, x + 13, top + 9);
    g.lineBetween(x + 10, bottom - 14, x + 8, bottom);
    g.lineBetween(x + w - 12, bottom - 14, x + w - 4, bottom);
    g.lineBetween(x + w - 4, top + 15, x + w + 18, top);
  } else if (kind === "E05") {
    g.fillRect(x + 8, top + 15, w - 16, h - 15);
    g.fillRect(x + w * 0.3, top, w * 0.4, 25);
    g.lineStyle(2, t.paper, 0.6);
    g.lineBetween(x + 10, top + 45, x + w - 10, top + 45);
    g.lineBetween(x + w / 2, top + 18, x + w / 2, bottom);
    const mx = active ? x - 110 : x - 10,
      my = cue ? top - 30 : active ? bottom - 18 : top + 25;
    g.lineStyle(5, t.ink);
    g.lineBetween(x + 10, top + 35, mx, my);
    g.fillCircle(mx, my, 15);
  } else {
    g.fillCircle(x + w / 2, top + 11, 10);
    g.fillTriangle(x + 5, bottom, x + w / 2, top + 23, x + w - 3, bottom);
    g.lineStyle(4, t.ink);
    g.lineBetween(x + 5, top + 34, x + w + 4, top + 39);
    if (kind === "E02") {
      const reach = active ? 150 : cue ? 45 : 70;
      const lanceY = strike
        ? ground + (strike.top + strike.bottom) / scale / 2
        : top + 54;
      g.lineBetween(x + 15, lanceY, x - reach, lanceY);
      g.fillTriangle(
        x - reach,
        lanceY,
        x - reach + 13,
        lanceY - 5,
        x - reach + 13,
        lanceY + 5,
      );
    } else if (kind === "E04") {
      g.lineStyle(3, t.ink);
      g.beginPath();
      g.arc(x + 8, top + 42, 24, -1.3, 1.3);
      g.strokePath();
      g.lineStyle(1, t.ink);
      g.lineBetween(x + 14, top + 19, x + 14, top + 64);
      if (cue) {
        const y = ground + (e.actor?.variant ? -70 : -16);
        g.lineStyle(1, t.accent, 0.8);
        for (let j = 0; j < 4; j++)
          g.lineBetween(x - j * 25, y, x - j * 25 - 14, y);
      }
    } else if (kind === "E07") {
      g.fillTriangle(x + 5, top + 8, x + w / 2, top - 6, x + w - 2, top + 17);
      g.fillStyle(t.paper);
      g.fillTriangle(x - 9, top + 47, x - 19, top + 56, x - 5, top + 59);
    } else if (kind === "E08") {
      const high = e.actor?.variant === 1,
        y = high ? top + 18 : bottom - 15,
        reach = active ? 70 : 30;
      g.lineStyle(3, t.ink);
      g.lineBetween(x + 12, top + 40, x - reach, y);
      g.lineBetween(x + 20, top + 43, x + 55, y + 12);
    } else if (cue || active) {
      g.lineStyle(3, t.ink);
      g.lineBetween(
        x + 8,
        top + 35,
        active ? x - 70 : x - 15,
        active ? bottom - 25 : top - 20,
      );
    }
  }
  if (cue) {
    g.lineStyle(2, t.accent);
    g.strokeTriangle(
      x + w / 2 - 7,
      top - 13,
      x + w / 2 + 7,
      top - 13,
      x + w / 2,
      top - 27,
    );
  }
  if (phase === "RECOVERY") {
    g.lineStyle(2, t.paper);
    g.strokeCircle(x + w / 2, top + 10, 13);
  }
}

import type { SimState, SimEvent, Rules } from "@ronin/runner-core";
export const RIG_VERSION = "rr-rig-2";
export const ANIMATIONS = [
  "IDLE",
  "RUN",
  "JUMP_START",
  "JUMP_APEX",
  "DOUBLE_JUMP",
  "FALL",
  "LAND",
  "SLIDE_START",
  "SLIDE_LOOP",
  "SLIDE_END",
  "ATTACK_WINDUP",
  "ATTACK_ACTIVE",
  "ATTACK_RECOVERY",
  "PERFECT",
  "SPECIAL",
  "HURT",
  "DEATH_HP",
  "DEATH_ABYSS",
] as const;
export type Animation = (typeof ANIMATIONS)[number];
type Point = readonly [number, number];
export interface Brush {
  line(
    points: readonly Point[],
    color: number,
    width: number,
    alpha?: number,
  ): void;
  polygon(points: readonly Point[], color: number, alpha?: number): void;
  circle(x: number, y: number, r: number, color: number, alpha?: number): void;
}
export interface Pose {
  locomotion: Animation;
  action: "NONE" | "ATTACK_WINDUP" | "ATTACK_ACTIVE" | "ATTACK_RECOVERY";
  tick: number;
  progress: number;
  slide: boolean;
  hurt: boolean;
  perfect: boolean;
  special: boolean;
  dead: boolean;
}
/** Visual-only pose selection. Never mutates state or consumes competitive RNG. */
export function poseFor(
  s: SimState | undefined,
  r: Rules,
  events: readonly SimEvent[] = [],
  menuTick = 0,
): Pose {
  const tick = s?.tick ?? menuTick;
  const recent = (type: SimEvent["type"], duration: number) =>
    events.some(
      (e) => e.type === type && tick - e.tick >= 0 && tick - e.tick < duration,
    );
  const age = (s?.attackAge ?? -1) - 1;
  const action =
    age < 0
      ? "NONE"
      : age < r.attackWindup
        ? "ATTACK_WINDUP"
        : age < r.attackWindup + r.attackActive
          ? "ATTACK_ACTIVE"
          : age < r.attackWindup + r.attackActive + r.attackRecovery
            ? "ATTACK_RECOVERY"
            : "NONE";
  const slide = !!s && s.slideUntil > 0 && tick <= s.slideUntil;
  let locomotion: Animation = !s
    ? "IDLE"
    : s.status === "DEAD"
      ? s.endReason === "ABYSS"
        ? "DEATH_ABYSS"
        : "DEATH_HP"
      : slide
        ? recent("SLIDE", 4)
          ? "SLIDE_START"
          : "SLIDE_LOOP"
        : s.slideUntil > 0 && tick < s.slideUntil + 4
          ? "SLIDE_END"
          : !s.grounded
            ? s.jumps === 2 && s.vy < 0
              ? "DOUBLE_JUMP"
              : Math.abs(s.vy) < 100000
                ? "JUMP_APEX"
                : s.vy < 0
                  ? "JUMP_START"
                  : "FALL"
            : recent("LAND", 5)
              ? "LAND"
              : "RUN";
  if (recent("DAMAGE", 10) && s?.status !== "DEAD") locomotion = "HURT";
  return {
    locomotion,
    action,
    tick,
    progress: Math.max(0, age),
    slide,
    hurt: !!s && tick < s.invulnerableUntil,
    perfect: recent("PERFECT", 12),
    special: !!s?.combat && tick < s.combat.specialUntil,
    dead: s?.status === "DEAD",
  };
}
export function demoPose(animation: Animation, tick: number): Pose {
  const action = animation.startsWith("ATTACK_")
    ? (animation as Pose["action"])
    : "NONE";
  return {
    locomotion: animation,
    action,
    tick,
    progress: tick % 22,
    slide: animation === "SLIDE_START" || animation === "SLIDE_LOOP",
    hurt: animation === "HURT",
    perfect: animation === "PERFECT",
    special: animation === "SPECIAL",
    dead: animation.startsWith("DEATH_"),
  };
}
/** Shared layered vector rig: feet/hip/shoulder/head/wrist/sheath pivots. */
export function drawRig(
  b: Brush,
  p: Pose,
  r: Rules,
  reduced = false,
  debug = false,
) {
  const ink = 0x2a2528,
    cloth = 0x3a4035,
    red = 0xa64340,
    paper = 0xf2e7ce,
    skin = 0xb99763;
  const swing =
    reduced || p.locomotion === "IDLE" ? 0 : Math.sin(p.tick * 0.33);
  const air = ["JUMP_START", "JUMP_APEX", "DOUBLE_JUMP", "FALL"].includes(
    p.locomotion,
  );
  const sx =
      (p.slide ? r.slideWidth : r.bodyWidth) / r.scale / (p.slide ? 54 : 44),
    sy =
      (p.slide ? r.slideHeight : r.bodyHeight) / r.scale / (p.slide ? 44 : 88);
  const crouch = p.locomotion === "LAND" || p.locomotion === "SLIDE_END";
  const hip: Point = p.slide
    ? [-12, -18]
    : p.dead
      ? [-10, -22]
      : crouch
        ? [0, -31]
        : [0, -39];
  const shoulder: Point = p.slide
    ? [17, -30]
    : p.dead
      ? [12, -37]
      : crouch
        ? [7, -59]
        : p.locomotion === "HURT"
          ? [-7, -65]
          : [2, -67];
  const head: Point = p.slide
    ? [31, -34]
    : p.dead
      ? [25, -43]
      : crouch
        ? [7, -71]
        : p.locomotion === "HURT"
          ? [-7, -77]
          : [2, -79];
  const scaled = (pts: readonly Point[]) =>
    pts.map(([x, y]) => [x * sx, y * sy] as Point);
  const line = (pts: readonly Point[], color = ink, width = 5, alpha = 1) =>
    b.line(scaled(pts), color, width, alpha);
  const poly = (pts: readonly Point[], color = ink, alpha = 1) =>
    b.polygon(scaled(pts), color, alpha);
  const circle = (
    x: number,
    y: number,
    rad: number,
    color: number,
    alpha = 1,
  ) => b.circle(x * sx, y * sy, rad * Math.min(sx, sy), color, alpha);
  const kneeBack: Point = p.slide
    ? [-24, -11]
    : air
      ? p.locomotion === "FALL"
        ? [-10, -12]
        : p.locomotion === "JUMP_START"
          ? [-22, -24]
          : [-18, -30]
      : [-11 - swing * 9, -18];
  const kneeFront: Point = p.slide
    ? [13, -8]
    : air
      ? p.locomotion === "FALL"
        ? [12, -14]
        : p.locomotion === "JUMP_START"
          ? [16, -16]
          : [19, -29]
      : [12 + swing * 9, -19];
  line([hip, kneeBack, p.slide ? [-33, -2] : [-16 + swing * 13, -1]], ink, 7);
  // Sheath and rear sleeve precede torso, avoiding a blade through the face.
  line(
    [
      [hip[0] - 5, hip[1] - 4],
      [hip[0] - 38, hip[1] + 18],
    ],
    ink,
    5,
  );
  line(
    [shoulder, [shoulder[0] - 13, shoulder[1] + 17], [hip[0] - 12, hip[1]]],
    cloth,
    9,
  );
  line([hip, kneeFront, p.slide ? [33, -2] : [15 - swing * 13, -1]], ink, 7);
  poly(
    [
      [shoulder[0] - 13, shoulder[1] - 1],
      [shoulder[0] + 13, shoulder[1] + 2],
      [hip[0] + 20, hip[1] + 18],
      [hip[0] - 21, hip[1] + 17],
    ],
    ink,
  );
  poly(
    [
      [shoulder[0] - 10, shoulder[1] + 2],
      [shoulder[0] + 6, shoulder[1] + 5],
      [hip[0] + 11, hip[1] + 14],
      [hip[0] - 14, hip[1] + 12],
    ],
    cloth,
  );
  line([[shoulder[0] - 6, shoulder[1] + 4], hip], paper, 1, 0.45);
  poly(
    [
      [hip[0] - 17, hip[1] - 4],
      [hip[0] + 16, hip[1] - 2],
      [hip[0] + 16, hip[1] + 4],
      [hip[0] - 18, hip[1] + 2],
    ],
    red,
  );
  poly(
    [
      [hip[0] - 14, hip[1] - 3],
      [hip[0] - 49 - (reduced ? 0 : swing * 4), hip[1] - 17],
      [hip[0] - 34, hip[1] + 2],
    ],
    red,
  );
  circle(head[0], head[1], 9, skin);
  poly(
    [
      [head[0] - 10, head[1] - 8],
      [head[0] + 5, head[1] - 10],
      [head[0] + 10, head[1] - 1],
      [head[0] - 10, head[1] - 1],
    ],
    ink,
  );
  line(
    [
      [head[0] + 3, head[1] + 1],
      [head[0] + 7, head[1] + 1],
    ],
    ink,
    1.5,
  );
  poly(
    [
      [head[0] - 25, head[1] - 7],
      [head[0], head[1] - 22],
      [head[0] + 27, head[1] - 6],
    ],
    ink,
  );
  line(
    [
      [head[0] - 25, head[1] - 5],
      [head[0] + 27, head[1] - 4],
    ],
    skin,
    1.5,
  );
  const wrist: Point =
    p.action === "ATTACK_WINDUP"
      ? [shoulder[0] + 8, shoulder[1] - 4]
      : p.action === "ATTACK_ACTIVE"
        ? [25, -48]
        : p.action === "ATTACK_RECOVERY"
          ? [35, -26]
          : [shoulder[0] + 19, shoulder[1] + 24];
  line([shoulder, [shoulder[0] + 15, shoulder[1] + 12], wrist], ink, 7);
  circle(wrist[0], wrist[1], 3, skin);
  if (p.action === "ATTACK_ACTIVE" || p.special || p.perfect) {
    const reach =
      (p.special ? (r.specialReach ?? r.swordReach) : r.swordReach) /
      r.scale /
      sx;
    line(
      [
        [22, -48],
        [22 + reach, -51],
      ],
      ink,
      3,
    );
    line(
      [
        [29, -54],
        [29 + reach * 0.7, -64],
        [22 + reach, -51],
        [28 + reach * 0.7, -33],
      ],
      p.perfect ? 0x6b8768 : red,
      reduced ? 2 : 4,
      0.8,
    );
  } else {
    line(
      [
        wrist,
        [wrist[0] + (p.action === "ATTACK_WINDUP" ? -27 : 37), wrist[1] - 34],
      ],
      ink,
      3,
    );
    line(
      [
        [wrist[0] - 5, wrist[1] - 3],
        [wrist[0] + 4, wrist[1] + 4],
      ],
      skin,
      2,
    );
  }
  if (p.hurt)
    line(
      [
        [-25, -8],
        [-30, -77],
      ],
      red,
      2,
      reduced ? 0.65 : 1,
    );
  if (p.locomotion === "DOUBLE_JUMP" && !reduced)
    line(
      [
        [-25, 4],
        [0, 10],
        [23, 4],
      ],
      ink,
      2,
      0.5,
    );
  if (p.locomotion === "LAND" && !reduced)
    line(
      [
        [-29, 0],
        [-39, 2],
      ],
      ink,
      2,
      0.5,
    );
  if (debug) {
    line(
      p.slide
        ? [
            [-27, -44],
            [27, -44],
            [27, 0],
            [-27, 0],
            [-27, -44],
          ]
        : [
            [-22, -88],
            [22, -88],
            [22, 0],
            [-22, 0],
            [-22, -88],
          ],
      red,
      1,
      0.6,
    );
    for (const [x, y] of [hip, shoulder, head, wrist]) circle(x, y, 2, red);
  }
}
export function canvasBrush(ctx: CanvasRenderingContext2D): Brush {
  const color = (v: number) => "#" + v.toString(16).padStart(6, "0");
  return {
    line(points, c, width, alpha = 1) {
      ctx.beginPath();
      ctx.strokeStyle = color(c);
      ctx.lineWidth = width;
      ctx.globalAlpha = alpha;
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    polygon(points, c, alpha = 1) {
      ctx.beginPath();
      ctx.fillStyle = color(c);
      ctx.globalAlpha = alpha;
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    },
    circle(x, y, r, c, alpha = 1) {
      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color(c);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  };
}

import type { Action } from "@ronin/runner-core";
/** CSS-pixel recognizer, separate from canvas scaling and competitive physics. */
export class Gestures {
  private active:
    | {
        id: number;
        x: number;
        y: number;
        at: number;
        swiped: boolean;
        distance: number;
      }
    | undefined;
  private blocked = false;
  down(id: number, x: number, y: number, at: number) {
    if (this.active) {
      this.blocked = true;
      this.active = undefined;
      return;
    }
    if (!this.blocked)
      this.active = { id, x, y, at, swiped: false, distance: 0 };
  }
  move(id: number, x: number, y: number): Action | undefined {
    const a = this.active;
    if (!a || a.id !== id || a.swiped || this.blocked) return;
    const dx = x - a.x,
      dy = y - a.y;
    a.distance = Math.max(a.distance, Math.hypot(dx, dy));
    if (Math.abs(dy) >= 35 && Math.abs(dy) > 1.3 * Math.abs(dx)) {
      a.swiped = true;
      return dy < 0 ? "JUMP" : "SLIDE";
    }
  }
  up(id: number, x: number, y: number, at: number): Action | undefined {
    const a = this.active;
    if (!a || a.id !== id) return;
    const action = this.move(id, x, y);
    const tap =
      !a.swiped &&
      Math.max(a.distance, Math.hypot(x - a.x, y - a.y)) < 18 &&
      at - a.at < 230;
    this.active = undefined;
    if (!this.blocked && tap) return "ATTACK";
    return action;
  }
  invalidate() {
    this.active = undefined;
    this.blocked = true;
  }
  cancel() {
    this.active = undefined;
    this.blocked = false;
  }
  releaseAll() {
    this.cancel();
  }
}

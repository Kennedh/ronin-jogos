import { createState, control, step, worldAtTick } from "@ronin/runner-core";
import type { Action, SimState, SimEvent, World } from "@ronin/runner-core";
import { courseFor } from "@ronin/content/runner-manifest";
import type { RunnerManifest } from "@ronin/content/runner-manifest";
import type { RunTicket } from "./api.ts";
import { FixedClock } from "./clock.ts";
import { Recorder } from "./recorder.ts";
export type PauseReason =
  "manual" | "focus" | "orientation" | "fullscreen" | "frame" | "buffer";
export type SessionPhase =
  "ready" | "running" | "paused" | "countdown" | "ended";
/** Render/input adapter. This is the same core and world used by the verifier. */
export class RunSession {
  readonly ticket: RunTicket;
  readonly manifest: RunnerManifest;
  readonly recorder: Recorder;
  state: SimState;
  phase: SessionPhase = "ready";
  pauseReason: PauseReason = "manual";
  countdown = 3;
  events: readonly SimEvent[] = [];
  recentEvents: readonly SimEvent[] = [];
  private queued = new Set<Action>();
  private clock = new FixedClock();
  private previousMicros: number | null = null;
  private countdownAt = 0;
  private course: World;
  private courseEnd = 0;
  onChange: () => void = () => {};
  onEnd: () => void = () => {};
  constructor(ticket: RunTicket, manifest: RunnerManifest) {
    this.ticket = ticket;
    this.manifest = manifest;
    this.state = createState(
      ticket.seed,
      manifest.physics,
      ticket.starting_region_id,
    );
    this.recorder = new Recorder(ticket);
    this.course = courseFor(
      manifest,
      ticket.seed,
      0,
      2000000,
      ticket.starting_region_id,
    );
    this.courseEnd = 2000000;
  }
  get world() {
    if (this.state.distance > this.courseEnd - 1000000) {
      this.courseEnd = this.state.distance + 2000000;
      this.course = courseFor(
        this.manifest,
        this.ticket.seed,
        this.state.distance,
        this.courseEnd,
        this.ticket.starting_region_id,
      );
    }
    return this.course;
  }
  get renderWorld() {
    return this.state.journey
      ? worldAtTick(
          this.world,
          Math.max(0, this.state.tick - 1),
          this.state.resolved,
        )
      : this.world;
  }
  input(action: Action) {
    if (this.phase === "running") this.queued.add(action);
  }
  begin() {
    if (this.phase !== "ready") return;
    this.phase = "running";
    this.previousMicros = null;
    this.onChange();
  }
  pause(reason: PauseReason = "manual") {
    if (this.phase !== "running" && this.phase !== "countdown") return;
    if (this.state.status === "RUNNING") {
      this.state = control(this.state, "PAUSE");
      this.recorder.control(this.state.tick, "PAUSE");
      this.recorder.seal(this.state.tick);
    }
    this.phase = "paused";
    this.pauseReason = reason;
    this.previousMicros = null;
    this.queued.clear();
    this.clock = new FixedClock();
    this.onChange();
  }
  resume(nowMs: number) {
    if (this.phase !== "paused") return;
    this.phase = "countdown";
    this.countdownAt = nowMs;
    this.countdown = 3;
    this.onChange();
  }
  quit() {
    if (this.phase === "ended") return;
    this.state = control(this.state, "QUIT");
    this.recorder.control(this.state.tick, "QUIT");
    this.end();
  }
  frame(nowMs: number) {
    if (this.phase === "countdown") {
      const elapsed = nowMs - this.countdownAt,
        next = Math.max(1, 3 - Math.floor(elapsed / 1000));
      if (next !== this.countdown) {
        this.countdown = next;
        this.onChange();
      }
      if (elapsed >= 3000) {
        this.state = control(this.state, "RESUME");
        this.recorder.control(this.state.tick, "RESUME");
        this.phase = "running";
        this.previousMicros = null;
        this.onChange();
      }
      return;
    }
    if (this.phase !== "running") return;
    const current = Math.round(nowMs * 1000),
      previous = this.previousMicros;
    this.previousMicros = current;
    if (previous === null) return;
    const elapsed = current - previous;
    if (elapsed < 0 || elapsed > 250000) {
      this.pause("frame");
      return;
    }
    this.clock.advance(elapsed, () => {
      if (this.phase !== "running") return;
      if (this.recorder.nearlyFull || this.recorder.fault) {
        this.pause("buffer");
        return;
      }
      const actions = (["JUMP", "SLIDE", "ATTACK"] as const)
        .filter((a) => this.queued.has(a))
        .slice(0, 2);
      this.queued.clear();
      for (const action of actions)
        this.recorder.action(this.state.tick, action);
      const update = step(
        this.state,
        actions,
        this.world,
        this.manifest.physics,
      );
      this.state = update.state;
      this.events = update.events;
      this.recentEvents = [
        ...this.recentEvents.filter((e) => this.state.tick - e.tick < 60),
        ...update.events,
      ].slice(-64);
      this.recorder.afterTick(this.state.tick);
      if (this.state.status === "DEAD") this.end();
    });
    this.onChange();
  }
  private end() {
    this.phase = "ended";
    this.queued.clear();
    this.previousMicros = null;
    this.onChange();
    this.onEnd();
  }
}

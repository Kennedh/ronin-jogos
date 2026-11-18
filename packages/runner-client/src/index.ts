import { TICK_RATE } from "@ronin/runner-core";
/** Render adapter's clock contract; simulation must not follow render FPS. */
export const SIMULATION_STEP_MS = 1000 / TICK_RATE;
export interface RendererLifecycle {
  destroy(): void;
}
/** Phaser renderer is a browser-only subpath; core/client remain usable in Node. */

export { FixedClock } from "./clock.ts";

export { RunnerApi, ClientError } from "./api.ts";
export type { RunTicket, RunStatus } from "./api.ts";
export { RunSession } from "./session.ts";
export type { SessionPhase, PauseReason } from "./session.ts";
export { Recorder } from "./recorder.ts";
export { Gestures } from "./gestures.ts";
export { Submission } from "./submission.ts";

export {
  poseFor,
  demoPose,
  drawRig,
  canvasBrush,
  ANIMATIONS,
  RIG_VERSION,
} from "./rig.ts";
export type { Animation, Pose, Brush } from "./rig.ts";

export {
  DEFAULT_BINDINGS,
  parseBindings,
  rebind,
  actionFor,
  keyLabel,
} from "./bindings.ts";

export { abyssAhead } from "./warnings.ts";

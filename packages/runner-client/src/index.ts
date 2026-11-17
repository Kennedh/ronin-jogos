import { TICK_RATE } from "@ronin/runner-core";
/** Render adapter's clock contract; simulation must not follow render FPS. */
export const SIMULATION_STEP_MS = 1000 / TICK_RATE;
export interface RendererLifecycle {
  destroy(): void;
}
/** Scene implementation and mounting belong to 1D, after the core exists. */

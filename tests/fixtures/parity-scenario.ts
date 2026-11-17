import { createState, createWorld, step } from "@ronin/runner-core";
import type { Action } from "@ronin/runner-core";
import {
  encodeSegment,
  decodeSegment,
  segmentHash,
} from "@ronin/contracts/replay";
import { FixedClock } from "@ronin/runner-client";
import { canonical, stateHash } from "@ronin/contracts/canonical";
export async function parityScenario(fps: number) {
  const world = createWorld(
    [{ start: 900000, end: 1100000 }],
    [
      {
        id: "soldier",
        kind: "ENEMY",
        x: 120000,
        width: 30000,
        top: -88000,
        bottom: 0,
        idealTick: 4,
      },
    ],
  );
  let state = createState("0123456789abcdeffedcba9876543210");
  const inputs: Record<number, Action[]> = {
    0: ["JUMP", "ATTACK"],
    1: ["JUMP"],
    140: ["JUMP"],
    160: ["JUMP"],
  };
  const segment = decodeSegment(
    encodeSegment({
      protocol: "rr-input-v1",
      run_id: "a0000000-0000-4000-8000-000000000001",
      index: 0,
      start_tick: 0,
      end_tick: 600,
      previous_hash: null,
      actions: Object.entries(inputs).flatMap(([tick, actions]) =>
        actions.map((action) => ({ tick: Number(tick), action })),
      ),
      controls: [],
    }),
  );
  const commands: Record<number, Action[]> = {};
  for (const a of segment.actions) (commands[a.tick] ??= []).push(a.action);
  const clock = new FixedClock(),
    trace: string[] = [];
  let previous = 0;
  for (let frame = 1; frame <= fps * 10; frame++) {
    const now = Math.floor((frame * 1000000) / fps);
    clock.advance(now - previous, () => {
      state = step(state, commands[state.tick] ?? [], world).state;
      trace.push(canonical(state));
    });
    previous = now;
  }
  return {
    segmentHash: await segmentHash(segment),
    hash: await stateHash(state),
    traceHash: await stateHash(trace),
    state,
    updates: trace.length,
  };
}

import { validate } from "./index.ts";
import { canonical, parseJson, sha256 } from "./canonical.ts";
import type { components } from "./generated/types.ts";
export type ReplaySegment = components["schemas"]["ReplaySegment"];
export type FinishRequest = components["schemas"]["FinishRequest"];
const priority = { JUMP: 0, SLIDE: 1, ATTACK: 2 };
export function validateSegment(value: unknown): ReplaySegment {
  if (!validate("ReplaySegment", value))
    throw new Error("invalid_segment_schema");
  const s = value as ReplaySegment;
  if (s.end_tick < s.start_tick || s.end_tick - s.start_tick > 3600)
    throw new Error("segment_interval");
  if (
    (s.index === 0 && (s.start_tick !== 0 || s.previous_hash !== null)) ||
    (s.index > 0 && s.previous_hash === null)
  )
    throw new Error("segment_origin");
  if (
    s.start_tick === s.end_tick &&
    (s.actions.length > 0 || s.controls.length === 0)
  )
    throw new Error("empty_segment");
  let previousTick = -1,
    lastPriority = -1,
    count = 0;
  for (const action of s.actions) {
    if (action.tick < s.start_tick || action.tick >= s.end_tick)
      throw new Error("action_outside_segment");
    if (action.tick < previousTick) throw new Error("action_order");
    if (action.tick !== previousTick) {
      count = 0;
      lastPriority = -1;
    }
    if (++count > 2 || priority[action.action] <= lastPriority)
      throw new Error("duplicate_or_unordered_action");
    previousTick = action.tick;
    lastPriority = priority[action.action];
  }
  let sequence = -1,
    tick = s.start_tick;
  for (const c of s.controls) {
    if (c.tick < tick || c.tick > s.end_tick || c.sequence <= sequence)
      throw new Error("control_order");
    sequence = c.sequence;
    tick = c.tick;
  }
  return s;
}
export function encodeSegment(value: unknown): Uint8Array {
  const s = validateSegment(value);
  const bytes = new TextEncoder().encode(canonical(s));
  if (bytes.length > 262144) throw new Error("encoded_limit");
  return bytes;
}
export function decodeSegment(bytes: Uint8Array): ReplaySegment {
  if (bytes.length > 262144) throw new Error("encoded_limit");
  return validateSegment(parseJson(bytes));
}
export async function segmentHash(s: ReplaySegment): Promise<string> {
  validateSegment(s);
  return sha256(new TextEncoder().encode("rr-input-v1\n" + canonical(s)));
}
export interface ReplayCursor {
  runId: string;
  nextIndex: number;
  nextTick: number;
  hash: string | null;
  controlSequence: number;
  paused: boolean;
  quit: boolean;
}
export function replayCursor(runId: string): ReplayCursor {
  return {
    runId,
    nextIndex: 0,
    nextTick: 0,
    hash: null,
    controlSequence: -1,
    paused: false,
    quit: false,
  };
}
/** Ordered verifier cursor; storage may receive parts out of order in 1C. */
export async function appendSegment(
  cursor: ReplayCursor,
  input: unknown,
): Promise<ReplayCursor> {
  const s = validateSegment(input);
  if (
    cursor.quit ||
    s.run_id !== cursor.runId ||
    s.index !== cursor.nextIndex ||
    s.start_tick !== cursor.nextTick ||
    s.previous_hash !== cursor.hash
  )
    throw new Error("chain_mismatch");
  let paused = cursor.paused,
    quit = false,
    sequence = cursor.controlSequence;
  let tick = s.start_tick;
  const actions = new Map<number, ReplaySegment["actions"]>();
  for (const a of s.actions) {
    const list = actions.get(a.tick) ?? [];
    list.push(a);
    actions.set(a.tick, list);
  }
  for (const c of s.controls) {
    if (c.sequence <= sequence || (paused && c.tick !== tick))
      throw new Error("invalid_control_sequence");
    if (quit) throw new Error("control_after_quit");
    if (c.action === "PAUSE") {
      if (paused) throw new Error("already_paused");
      paused = true;
    } else if (c.action === "RESUME") {
      if (!paused) throw new Error("not_paused");
      paused = false;
    } else quit = true;
    sequence = c.sequence;
    tick = c.tick;
    // Actions on the same tick are evaluated after all its controls below.
  }
  // Determine active state at every action and at the segment boundary.
  let active = !cursor.paused,
    ended = false,
    controlIndex = 0;
  for (const [actionTick] of actions) {
    while (
      controlIndex < s.controls.length &&
      s.controls[controlIndex]!.tick <= actionTick
    ) {
      const c = s.controls[controlIndex++]!;
      if (c.action === "QUIT") ended = true;
      else active = c.action === "RESUME";
    }
    if (!active || ended) throw new Error("action_while_stopped");
  }
  if ((paused || quit) && s.end_tick !== tick)
    throw new Error("tick_advanced_while_stopped");
  if (!Number.isSafeInteger(cursor.nextIndex + 1))
    throw new Error("index_overflow");
  return {
    runId: cursor.runId,
    nextIndex: cursor.nextIndex + 1,
    nextTick: s.end_tick,
    hash: await segmentHash(s),
    controlSequence: sequence,
    paused,
    quit,
  };
}
export function assertFinish(
  cursor: ReplayCursor,
  finish: unknown,
): FinishRequest {
  if (!validate("FinishRequest", finish))
    throw new Error("invalid_finish_schema");
  const f = finish as FinishRequest;
  if (
    f.final_segment_index !== cursor.nextIndex - 1 ||
    f.final_tick !== cursor.nextTick ||
    f.final_hash !== cursor.hash ||
    cursor.quit !== (f.end_reason === "QUIT") ||
    (f.final_tick === 0 && f.end_reason !== "QUIT")
  )
    throw new Error("finish_mismatch");
  return f;
}

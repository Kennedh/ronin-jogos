import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  RunSession,
  Recorder,
  Gestures,
  RunnerApi,
  Submission,
} from "@ronin/runner-client";
import type { RunTicket } from "@ronin/runner-client";
import {
  FOUNDATION_MANIFEST,
  manifestHash,
  primitiveCourse,
} from "@ronin/content/runner-manifest";
import { DEFAULT_POLICY } from "@ronin/data";
import {
  appendSegment,
  replayCursor,
  assertFinish,
} from "@ronin/contracts/replay";
import { createState, playSegment } from "@ronin/runner-core";
import { stateHash } from "@ronin/contracts/canonical";
const ticket: RunTicket = {
  run_id: "a0000000-0000-4000-8000-000000000001",
  mode: "FULL",
  starting_region_id: "BAMBOO",
  seed: "0123456789abcdeffedcba9876543210",
  started_at: "2026-11-17T00:00:00Z",
  expires_at: "2026-11-20T00:00:00Z",
  server_time: "2026-11-17T00:00:00Z",
  versions: {
    rules_major: 1,
    rules_patch: 0,
    generator_version: FOUNDATION_MANIFEST.generator_version,
    scoring_version: FOUNDATION_MANIFEST.scoring_version,
    replay_protocol_version: "rr-input-v1",
    rules_manifest_hash: await manifestHash(FOUNDATION_MANIFEST),
    assets_manifest_version: FOUNDATION_MANIFEST.assets_manifest_version,
  },
  limits: {
    ...DEFAULT_POLICY,
    segment_ticks: 3600,
    max_encoded_bytes: 262144,
    max_decoded_bytes: 1048576,
    max_actions_per_tick: 2,
    upload_grace_seconds: 86400,
  },
};
test("1D: render adapter records the same terminal physics that ordered playback verifies", async () => {
  const s = new RunSession(ticket, FOUNDATION_MANIFEST);
  s.begin();
  for (let i = 0; i < 400 && s.phase !== "ended"; i++) s.frame((i * 1000) / 60);
  assert.equal(s.state.endReason, "ABYSS");
  const finish = await s.recorder.finish(s.state.tick, "ABYSS");
  let cursor = replayCursor(ticket.run_id),
    state = createState(ticket.seed);
  for (const part of s.recorder.pending) {
    cursor = await appendSegment(cursor, part.segment);
    state = playSegment(
      state,
      part.segment,
      primitiveCourse(ticket.seed, 0, 4000000),
    );
  }
  assertFinish(cursor, finish);
  assert.equal(await stateHash(state), await stateHash(s.state));
});
test("1D: pause and countdown never advance physics; resuming preserves a replayable control sequence", async () => {
  const s = new RunSession(ticket, FOUNDATION_MANIFEST);
  s.begin();
  s.frame(0);
  s.input("JUMP");
  s.frame(17);
  s.pause();
  const frozen = await stateHash(s.state);
  s.input("ATTACK");
  s.frame(9000);
  assert.equal(await stateHash(s.state), frozen);
  s.resume(10000);
  s.frame(11000);
  assert.equal(s.countdown, 2);
  assert.equal(await stateHash(s.state), frozen);
  s.frame(13000);
  assert.equal(s.phase, "running");
  assert.equal(s.state.tick, 1);
  s.frame(13017);
  s.frame(13034);
  s.quit();
  const finish = await s.recorder.finish(s.state.tick, "QUIT");
  let cursor = replayCursor(ticket.run_id),
    state = createState(ticket.seed);
  for (const part of s.recorder.pending) {
    cursor = await appendSegment(cursor, part.segment);
    state = playSegment(
      state,
      part.segment,
      primitiveCourse(ticket.seed, 0, 4000000),
    );
  }
  assertFinish(cursor, finish);
  assert.equal(await stateHash(state), await stateHash(s.state));
  assert.deepEqual(
    s.recorder.pending.flatMap((p) => p.segment.controls.map((c) => c.action)),
    ["PAUSE", "RESUME", "QUIT"],
  );
});
test("1D: a long render gap pauses instead of catching up to a lethal frame", () => {
  const s = new RunSession(ticket, FOUNDATION_MANIFEST);
  s.begin();
  s.frame(0);
  s.frame(17);
  const tick = s.state.tick;
  s.frame(1500);
  assert.equal(s.phase, "paused");
  assert.equal(s.pauseReason, "frame");
  assert.equal(s.state.tick, tick);
  assert.equal(s.state.hp, 3);
});
test("1D: queued input deduplicates, prioritizes at most two actions, and cannot create a third jump", () => {
  const s = new RunSession(ticket, FOUNDATION_MANIFEST);
  s.begin();
  s.frame(0);
  s.input("JUMP");
  s.input("JUMP");
  s.frame(17);
  assert.equal(s.state.jumps, 1);
  s.input("JUMP");
  s.frame(34);
  assert.equal(s.state.jumps, 2);
  s.input("JUMP");
  s.frame(51);
  assert.equal(s.state.jumps, 2);
  s.pause();
  s.input("ATTACK");
  assert.equal(s.state.attackAge, -1);
  const slide = new RunSession(ticket, FOUNDATION_MANIFEST);
  slide.begin();
  slide.frame(0);
  slide.input("SLIDE");
  slide.frame(17);
  assert.equal(slide.state.slideUntil, 33);
});
test("1D: recorder segments at 3600 ticks, releases acknowledged payloads and preserves finish identity", async () => {
  const r = new Recorder(ticket);
  for (let tick = 1; tick <= 3600; tick++) r.afterTick(tick);
  await r.ready();
  assert.equal(r.pending.length, 1);
  const first = r.pending[0]!,
    hash = first.hash;
  r.acknowledge(first);
  assert.equal(r.pendingBytes, 0);
  assert.ok(r.totalBytes > 0);
  r.control(3600, "QUIT");
  const finish = await r.finish(3600, "QUIT");
  assert.equal(finish.final_segment_index, 1);
  assert.equal(r.pending[0]!.segment.previous_hash, hash);
  assert.equal(r.pending[0]!.segment.start_tick, 3600);
  assert.equal(r.pending[0]!.segment.end_tick, 3600);
});
test("1D: CSS-pixel gestures recognize early swipe, never turn swipe/drag/cancel/multitouch into tap", () => {
  const g = new Gestures();
  g.down(1, 100, 100, 0);
  assert.equal(g.move(1, 101, 64), "JUMP");
  assert.equal(g.move(1, 101, 30), undefined);
  assert.equal(g.up(1, 101, 30, 90), undefined);
  g.down(1, 100, 100, 0);
  assert.equal(g.move(1, 100, 140), "SLIDE");
  assert.equal(g.up(1, 100, 140, 70), undefined);
  g.down(1, 100, 100, 0);
  g.move(1, 125, 100);
  assert.equal(g.up(1, 100, 100, 60), undefined);
  g.down(1, 100, 100, 0);
  assert.equal(g.up(1, 100, 100, 230), undefined);
  g.down(1, 100, 100, 0);
  g.down(2, 110, 110, 1);
  assert.equal(g.up(1, 100, 100, 40), undefined);
  assert.equal(g.up(2, 110, 110, 50), undefined);
  g.invalidate();
  g.down(3, 120, 100, 60);
  assert.equal(g.move(3, 120, 60), undefined);
  assert.equal(g.up(3, 120, 60, 100), undefined);
  g.releaseAll();
  g.down(1, 100, 100, 0);
  g.cancel();
  assert.equal(g.up(1, 100, 100, 50), undefined);
  g.down(1, 100, 100, 0);
  assert.equal(g.up(1, 100, 100, 50), "ATTACK");
});
test("1D: standalone contracts work with runtime code generation forbidden", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--disallow-code-generation-from-strings",
      "--input-type=module",
      "-e",
      'import {validate} from "@ronin/contracts"; if(!validate("RunStart",{mode:"FULL"})||validate("RunStart",{mode:"FULL",score:1}))process.exitCode=1;',
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
});
test("1D: wrong ACK cannot release a replay part", async () => {
  const r = new Recorder(ticket);
  r.control(0, "QUIT");
  await r.finish(0, "QUIT");
  const part = r.pending[0]!;
  const api = new RunnerApi(async () =>
    Response.json({
      run_id: ticket.run_id,
      index: 99,
      segment_hash: part.hash,
      persisted: true,
    }),
  );
  await assert.rejects(
    () => api.upload(part.segment, part.hash, part.bytes),
    /INVALID_SERVER_RESPONSE/,
  );
  assert.equal(r.pending.length, 1);
});
test("1D: a lost finish ACK retries the identical commitment without inventing a verified score", async () => {
  const finishes: string[] = [];
  let failed = false;
  let hash = "";
  const api = new RunnerApi(async (input, init) => {
    const url = String(input);
    if (url.endsWith("/finish")) {
      finishes.push(String(init!.body));
      if (!failed) {
        failed = true;
        throw new TypeError("lost_ack");
      }
      return Response.json({ run_id: ticket.run_id, status: "PENDING" });
    }
    if (init?.method === "PUT") {
      const headers = init.headers as Record<string, string>;
      hash = headers["x-segment-hash"]!;
      return Response.json({
        run_id: ticket.run_id,
        index: 0,
        segment_hash: hash,
        persisted: true,
      });
    }
    return Response.json({ run_id: ticket.run_id, status: "PENDING" });
  });
  const r = new Recorder(ticket),
    submission = new Submission(api, r);
  r.control(0, "QUIT");
  await submission.finish(0, "QUIT");
  assert.equal(submission.received, false);
  assert.equal(submission.error?.code, "NETWORK_UNAVAILABLE");
  await submission.synchronize(true);
  assert.equal(finishes.length, 2);
  assert.equal(finishes[0], finishes[1]);
  assert.equal(submission.status?.status, "PENDING");
  assert.equal(submission.status?.score, undefined);
  assert.equal(submission.safeToLeave, true);
  assert.ok(hash);
  submission.dispose();
});

test("1D: dense command streams seal by bytes before they exceed the wire limit", async () => {
  const recorder = new Recorder(ticket);
  for (let tick = 0; tick < 7200; tick++) {
    recorder.action(tick, "JUMP");
    recorder.action(tick, "ATTACK");
    recorder.afterTick(tick + 1);
  }
  recorder.control(7200, "QUIT");
  const finish = await recorder.finish(7200, "QUIT");
  let cursor = replayCursor(ticket.run_id);
  assert.ok(recorder.pending.length > 2);
  for (const part of recorder.pending) {
    assert.ok(part.bytes.length <= 262144);
    assert.ok(part.segment.end_tick - part.segment.start_tick <= 3600);
    cursor = await appendSegment(cursor, part.segment);
  }
  assertFinish(cursor, finish);
});

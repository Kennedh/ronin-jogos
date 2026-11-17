import { test } from "node:test";
import assert from "node:assert/strict";
import { validate } from "@ronin/contracts";
const runId = "a0000000-0000-4000-8000-000000000001";
const hash = "a".repeat(64);
test("RR-SEC-001: run creation rejects client authority and mode/region mismatches", () => {
  assert.equal(validate("RunStart", { mode: "FULL" }), true);
  assert.equal(
    validate("RunStart", { mode: "REGIONAL", region_id: "TEMPLE" }),
    true,
  );
  for (const body of [
    { mode: "FULL", score: 999 },
    { mode: "FULL", player_id: runId },
    { mode: "FULL", seed: "chosen" },
    { mode: "FULL", region_id: "TEMPLE" },
    { mode: "REGIONAL" },
    { mode: "REGIONAL", region_id: "unknown" },
  ])
    assert.equal(validate("RunStart", body), false, JSON.stringify(body));
});
test("run ticket binds seed, immutable versions and explicit resource/transport policy", () => {
  const ticket = {
    run_id: runId,
    mode: "FULL",
    starting_region_id: "BAMBOO",
    seed: "a".repeat(32),
    versions: {
      rules_major: 1,
      rules_patch: 0,
      generator_version: "world-1",
      scoring_version: "score-1",
      replay_protocol_version: "rr-input-v1",
      rules_manifest_hash: hash,
      assets_manifest_version: "art-1",
    },
    started_at: "2026-11-17T00:00:00Z",
    expires_at: "2026-11-20T00:00:00Z",
    server_time: "2026-11-17T00:00:00Z",
    limits: {
      segment_ticks: 3600,
      max_encoded_bytes: 262144,
      max_decoded_bytes: 1048576,
      max_actions_per_tick: 2,
      upload_grace_seconds: 86400,
      max_run_encoded_bytes: 134217728,
      max_player_encoded_bytes: 536870912,
      max_segments_per_run: 10000,
      max_active_runs: 3,
      wall_time_tolerance_ticks: 120,
    },
  };
  assert.equal(validate("RunTicket", ticket), true);
  assert.equal(
    validate("RunTicket", { ...ticket, starting_region_id: "TEMPLE" }),
    false,
  );
  assert.equal(validate("RunTicket", { ...ticket, seed: "bad" }), false);
  assert.equal(
    validate("RunTicket", {
      ...ticket,
      versions: { ...ticket.versions, scoring_version: undefined },
    }),
    false,
  );
  assert.equal(validate("RunTicket", { ...ticket, started_at: "bad" }), false);
});
test("RR-RUN-004: replay contains commands, not client-computed kill/score/position", () => {
  const segment = {
    protocol: "rr-input-v1",
    run_id: runId,
    index: 0,
    start_tick: 0,
    end_tick: 3600,
    previous_hash: null,
    actions: [{ tick: 1, action: "JUMP" }],
    controls: [],
  };
  assert.equal(validate("ReplaySegment", segment), true);
  for (const action of ["KILL", "PERFECT_SLASH", "HEAL", "TELEPORT"])
    assert.equal(
      validate("ReplaySegment", { ...segment, actions: [{ tick: 1, action }] }),
      false,
    );
  assert.equal(validate("ReplaySegment", { ...segment, score: 999 }), false);
  assert.equal(
    validate("ReplaySegment", {
      ...segment,
      actions: [{ tick: -1, action: "JUMP" }],
    }),
    false,
  );
  assert.equal(
    validate("ReplaySegment", {
      ...segment,
      actions: [{ tick: 1, action: "JUMP", x: 1000 }],
    }),
    false,
  );
});
test("RR-DATA-001: only VERIFIED outcomes expose authoritative score and QUIT never ranks", () => {
  const outcome = {
    run_id: runId,
    status: "VERIFIED",
    score: "9007199254740993",
    distance_m: 1000,
    verified_at: "2026-11-17T00:00:00Z",
    end_reason: "HP_ZERO",
    ranked: true,
  };
  assert.equal(validate("RunStatus", outcome), true);
  assert.equal(
    validate("RunStatus", { run_id: runId, status: "PENDING" }),
    true,
  );
  assert.equal(validate("RunStatus", { ...outcome, status: "PENDING" }), false);
  assert.equal(
    validate("RunStatus", { run_id: runId, status: "VERIFIED" }),
    false,
  );
  assert.equal(
    validate("RunStatus", { ...outcome, end_reason: "QUIT" }),
    false,
  );
  assert.equal(
    validate("RunStatus", { ...outcome, end_reason: "QUIT", ranked: false }),
    true,
  );
  assert.equal(
    validate("RunStatus", { ...outcome, score: 9007199254740992 }),
    false,
  );
  assert.equal(validate("RunStatus", { ...outcome, score: "1e20" }), false);
});
test("finish identity cannot carry score, require SHA256 and safe ticks", () => {
  const body = {
    final_segment_index: 0,
    final_tick: 0,
    final_hash: hash,
    end_reason: "QUIT",
  };
  assert.equal(validate("FinishRequest", body), true);
  assert.equal(validate("FinishRequest", { ...body, score: "1" }), false);
  assert.equal(
    validate("FinishRequest", { ...body, final_hash: "xyz" }),
    false,
  );
  assert.equal(
    validate("FinishRequest", { ...body, final_tick: 2 ** 53 }),
    false,
  );
});

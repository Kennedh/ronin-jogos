import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { request as httpRequest } from "node:http";
import { fork } from "node:child_process";
import { gzipSync } from "node:zlib";
import { testPostgres } from "./helpers/postgres.ts";
import { harness, part } from "./helpers/runtime.ts";
import {
  migrate,
  VerificationQueue,
  LeaseLost,
  DEFAULT_POLICY,
  weekWindow,
  Runs,
} from "@ronin/data";
import { runOnce, verifyLease } from "@ronin/verifier";
import { segmentHash, encodeSegment } from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
import { canonical, stateHash } from "@ronin/contracts/canonical";
import {
  FOUNDATION_MANIFEST,
  primitiveCourse,
  manifestHash,
  loadManifest,
} from "@ronin/content/runner-manifest";
import { createState, step } from "@ronin/runner-core";

test(
  "1C: persistent API, hostile transport and fenced verifier on real PostgreSQL",
  { timeout: 180000 },
  async (t) => {
    const db = await testPostgres();
    await migrate(db.pool);
    let now = Date.parse("2026-11-17T00:00:00Z");
    const clock = () => new Date(now),
      advance = (ms: number) => {
        now += ms;
      };
    const reset = async () => {
      now = Date.parse("2026-11-17T00:00:00Z");
      await db.pool.query(
        "TRUNCATE players,rules_versions,api_rate_buckets CASCADE",
      );
    };
    const counts = async () => {
      const r = await db.pool.query(
        "SELECT (SELECT count(*) FROM run_outcomes)::integer AS outcomes,(SELECT count(*) FROM outbox_events)::integer AS events",
      );
      return r.rows[0] as { outcomes: number; events: number };
    };
    try {
      await t.test(
        "guest is durable, localized, host-only and restored without a new identity",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest("pt-PT,en;q=0.8");
            const again = await h.api.inject({
              method: "POST",
              url: "/api/v1/auth/guest",
              headers: h.headers(client),
              payload: {},
            });
            assert.equal(again.statusCode, 200);
            assert.equal(again.json().player_id, client.playerId);
            assert.equal(again.json().locale, "pt-BR");
            assert.equal(again.headers["x-csrf-token"], client.csrf);
            const other = await h.guest("fr-FR,pt-BR;q=0.5");
            const row = await db.pool.query(
              "SELECT locale FROM players WHERE id=$1",
              [other.playerId],
            );
            assert.equal(row.rows[0].locale, "en");
            const stored = (
              await db.pool.query(
                "SELECT verifier_digest,csrf_digest FROM sessions WHERE player_id=$1",
                [client.playerId],
              )
            ).rows[0];
            assert.equal(stored.verifier_digest.length, 32);
            assert.equal(stored.csrf_digest.length, 32);
            assert.notEqual(
              stored.csrf_digest.toString("base64url"),
              client.csrf,
            );
            advance(2 * 86400000);
            await h.api.inject({
              method: "POST",
              url: "/api/v1/auth/guest",
              headers: h.headers(client),
              payload: {},
            });
            const expiry = (
              await db.pool.query(
                "SELECT expires_at FROM sessions WHERE player_id=$1",
                [client.playerId],
              )
            ).rows[0].expires_at as Date;
            assert.equal(expiry.getTime(), now + 90 * 86400000);
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "origin/host/CSRF, forged and revoked cookies fail before mutation",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest();
            for (const headers of [
              { ...h.headers(client), origin: "https://arquivos.ronin.dev.br" },
              { ...h.headers(client), host: "evil.test" },
              { ...h.headers(client), "x-csrf-token": "bad" },
              { ...h.headers(client), "x-csrf-token": "é".repeat(43) },
            ]) {
              const r = await h.api.inject({
                method: "POST",
                url: "/api/v1/runs/start",
                headers,
                payload: { mode: "FULL" },
              });
              assert.equal(r.statusCode, 403);
              assert.ok(r.json().error.message_key);
            }
            const forged = {
              ...client,
              cookie:
                client.cookie.slice(0, -1) +
                (client.cookie.endsWith("a") ? "b" : "a"),
            };
            assert.equal(
              (
                await h.api.inject({
                  method: "POST",
                  url: "/api/v1/auth/guest",
                  headers: h.headers(forged),
                  payload: {},
                })
              ).statusCode,
              401,
            );
            await db.pool.query(
              "UPDATE sessions SET revoked_at=$2 WHERE player_id=$1",
              [client.playerId, clock()],
            );
            assert.equal(
              (
                await h.api.inject({
                  method: "POST",
                  url: "/api/v1/auth/guest",
                  headers: h.headers(client),
                  payload: {},
                })
              ).statusCode,
              401,
            );
            assert.equal(
              (await db.pool.query("SELECT count(*) FROM runs")).rows[0].count,
              "0",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "start retry is durable and concurrent; locked regional starts and mass assignment are denied",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              key = randomUUID();
            const replies = await Promise.all(
              [1, 2].map(() =>
                h.api.inject({
                  method: "POST",
                  url: "/api/v1/runs/start",
                  headers: { ...h.headers(client), "idempotency-key": key },
                  payload: { mode: "FULL" },
                }),
              ),
            );
            assert.deepEqual(
              replies.map((r) => r.statusCode).sort(),
              [200, 201],
            );
            assert.equal(replies[0]!.json().run_id, replies[1]!.json().run_id);
            assert.equal(
              (await db.pool.query("SELECT count(*) FROM runs")).rows[0].count,
              "1",
            );
            const conflict = await h.api.inject({
              method: "POST",
              url: "/api/v1/runs/start",
              headers: { ...h.headers(client), "idempotency-key": key },
              payload: { mode: "REGIONAL", region_id: "BAMBOO" },
            });
            assert.equal(conflict.statusCode, 409);
            for (const body of [
              { mode: "FULL", score: "999" },
              { mode: "FULL", player_id: client.playerId },
              { mode: "FULL", seed: "a".repeat(32) },
            ])
              assert.equal(
                (
                  await h.api.inject({
                    method: "POST",
                    url: "/api/v1/runs/start",
                    headers: {
                      ...h.headers(client),
                      "idempotency-key": randomUUID(),
                    },
                    payload: body,
                  })
                ).statusCode,
                422,
              );
            assert.equal(
              (
                await h.api.inject({
                  method: "POST",
                  url: "/api/v1/runs/start",
                  headers: {
                    ...h.headers(client),
                    "idempotency-key": randomUUID(),
                  },
                  payload: { mode: "REGIONAL", region_id: "TEMPLE" },
                })
              ).statusCode,
              403,
            );
            const regional = await h.start(client, randomUUID(), {
              mode: "REGIONAL",
              region_id: "BAMBOO",
            });
            assert.equal(regional.starting_region_id, "BAMBOO");
            await assert.rejects(
              () =>
                db.pool.query("UPDATE runs SET seed=$2 WHERE id=$1", [
                  regional.run_id,
                  "0".repeat(32),
                ]),
              /immutable_run_ticket/,
            );
            await assert.rejects(
              () =>
                db.pool.query(
                  "UPDATE rules_versions SET manifest='{}' WHERE manifest_hash=$1",
                  [regional.versions.rules_manifest_hash],
                ),
              /immutable_rules_manifest/,
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "out-of-order/gzip uploads and finish retry lead PENDING to VERIFIED exactly once",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client);
            advance(1000);
            const first = part(ticket, 60, false),
              last: ReplaySegment = {
                ...part(ticket, 60),
                index: 1,
                start_tick: 60,
                previous_hash: await segmentHash(first),
              };
            assert.equal(
              (await h.upload(client, last, "gzip")).statusCode,
              201,
            );
            const waiting = await h.finish(client, last);
            assert.equal(waiting.statusCode, 202);
            assert.equal(waiting.json().status, "AWAITING_SEGMENTS");
            const deadline = waiting.json().upload_deadline;
            advance(5000);
            assert.equal(
              (await h.finish(client, last)).json().upload_deadline,
              deadline,
            );
            assert.equal((await h.upload(client, first)).statusCode, 201);
            const pending = await h.status(client, ticket.run_id);
            assert.equal(pending.status, "PENDING");
            assert.equal(pending.score, undefined);
            const queue = new VerificationQueue(db.pool, clock),
              lease = (await queue.claim())!;
            assert.equal(
              (await h.status(client, ticket.run_id)).status,
              "VERIFYING",
            );
            assert.equal(
              await verifyLease(queue, lease, { ticksPerBatch: 7 }),
              "VERIFIED",
            );
            const verified = await h.status(client, ticket.run_id);
            assert.equal(verified.score, "90");
            assert.equal(verified.distance_m, 9);
            assert.equal(verified.ranked, false);
            assert.equal(verified.end_reason, "QUIT");
            assert.deepEqual(await counts(), { outcomes: 1, events: 1 });
            assert.equal(await runOnce(queue), "IDLE");
            const out = (
              await db.pool.query(
                "SELECT * FROM run_outcomes WHERE run_id=$1",
                [ticket.run_id],
              )
            ).rows[0];
            await queue.complete(lease, {
              score: out.score,
              distance: Number(out.real_distance),
              activeTicks: Number(out.active_ticks),
              endReason: out.end_reason,
              stateHash: out.state_hash,
            });
            assert.deepEqual(await counts(), { outcomes: 1, events: 1 });
            assert.equal(
              (await h.upload(client, first, "gzip")).statusCode,
              200,
            );
            assert.equal(
              (await h.finish(client, last)).json().status,
              "VERIFIED",
            );
            assert.equal(out.weekly_eligible, false);
            await assert.rejects(
              () =>
                db.pool.query(
                  "UPDATE run_segments SET payload=$2 WHERE run_id=$1",
                  [ticket.run_id, Buffer.from("{}")],
                ),
              /immutable_segment/,
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "all run operations enforce owner authorization before decoding hostile data",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const owner = await h.guest(),
              other = await h.guest(),
              ticket = await h.start(owner),
              s = part(ticket);
            assert.equal((await h.upload(other, s)).statusCode, 404);
            assert.equal((await h.finish(other, s)).statusCode, 404);
            assert.equal(
              (
                await h.api.inject({
                  url: `/api/v1/runs/${ticket.run_id}`,
                  headers: h.headers(other),
                })
              ).statusCode,
              404,
            );
            const early = await h.api.inject({
              method: "PUT",
              url: `/api/v1/runs/${ticket.run_id}/segments/0`,
              headers: {
                ...h.headers(other),
                "content-type": "application/octet-stream",
              },
              payload: Buffer.alloc(300000),
            });
            assert.equal(early.statusCode, 404);
            assert.equal(
              (await db.pool.query("SELECT count(*) FROM run_segments")).rows[0]
                .count,
              "0",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "encoded/decoded limits, invalid gzip, duplicate JSON, header and content hashes fail closed",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client),
              s = part(ticket),
              validHash = await segmentHash(s);
            const baseHeaders = {
              ...h.headers(client),
              "content-type": "application/octet-stream",
              "x-start-tick": "0",
              "x-end-tick": "60",
              "x-segment-hash": validHash,
            };
            for (const [payload, encoding, status] of [
              [Buffer.alloc(262145), "identity", 413],
              [gzipSync(Buffer.alloc(1048577, 32)), "gzip", 413],
              [Buffer.from("broken"), "gzip", 422],
              [encodeSegment(s), "br", 415],
              [
                Buffer.from(
                  canonical(s).replace('"index":0', '"index":0,"index":0'),
                ),
                "identity",
                422,
              ],
            ] as const) {
              const r = await h.api.inject({
                method: "PUT",
                url: `/api/v1/runs/${ticket.run_id}/segments/0`,
                headers: { ...baseHeaders, "content-encoding": encoding },
                payload: Buffer.from(payload),
              });
              assert.equal(r.statusCode, status, r.body);
            }
            const tamper = await h.api.inject({
              method: "PUT",
              url: `/api/v1/runs/${ticket.run_id}/segments/0`,
              headers: { ...baseHeaders, "x-segment-hash": "a".repeat(64) },
              payload: Buffer.from(encodeSegment(s)),
            });
            assert.equal(tamper.statusCode, 422);
            const duplicate = await h.api.inject({
              method: "POST",
              url: "/api/v1/runs/start",
              headers: {
                ...h.headers(client),
                "content-type": "application/json",
                "idempotency-key": randomUUID(),
              },
              payload: '{"mode":"FULL","mode":"FULL"}',
            });
            assert.equal(duplicate.statusCode, 422);
            assert.equal(
              (await db.pool.query("SELECT count(*) FROM run_segments")).rows[0]
                .count,
              "0",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "same index with divergent content and conflicting finish cannot replace accepted data",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client),
              s = part(ticket);
            advance(2000);
            const replies = await Promise.all([
              h.upload(client, s),
              h.upload(client, s, "gzip"),
            ]);
            assert.deepEqual(
              replies.map((r) => r.statusCode).sort(),
              [200, 201],
            );
            assert.equal(
              (
                await h.upload(client, {
                  ...s,
                  end_tick: 61,
                  controls: [{ tick: 61, sequence: 0, action: "QUIT" }],
                })
              ).statusCode,
              409,
            );
            assert.equal((await h.finish(client, s)).statusCode, 202);
            assert.equal(
              (await h.finish(client, s, "HP_ZERO")).statusCode,
              409,
            );
            assert.equal(
              (
                await db.pool.query(
                  "SELECT count(*) FROM run_verification_jobs",
                )
              ).rows[0].count,
              "1",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "a correct hash cannot prove a fabricated death or missing QUIT",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              queue = new VerificationQueue(db.pool, clock);
            for (const reason of ["HP_ZERO", "ABYSS", "QUIT"] as const) {
              const ticket = await h.start(client),
                s = part(ticket, 30, false);
              advance(1000);
              assert.equal((await h.upload(client, s)).statusCode, 201);
              assert.equal(
                (await h.finish(client, s, reason)).json().status,
                "PENDING",
              );
              assert.equal(await runOnce(queue), "REJECTED");
              const status = await h.status(client, ticket.run_id);
              assert.equal(status.status, "REJECTED");
              assert.equal(status.rejection_code, "REPLAY_INVALID");
              assert.equal(status.score, undefined);
            }
            assert.deepEqual(await counts(), { outcomes: 0, events: 0 });
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "real abyss is replayed from authoritative seed/course and can rank",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client);
            let state = createState(ticket.seed);
            const world = primitiveCourse(ticket.seed, 0, 3000000);
            let before = state;
            while (state.status === "RUNNING" && state.tick < 400) {
              before = state;
              state = step(state, [], world).state;
            }
            assert.equal(state.endReason, "ABYSS");
            assert.equal(before.hp, 2);
            assert.equal(state.hp, 0);
            const s = part(ticket, state.tick, false);
            advance(10000);
            assert.equal((await h.upload(client, s)).statusCode, 201);
            await h.finish(client, s, "ABYSS");
            assert.equal(
              await runOnce(new VerificationQueue(db.pool, clock), {
                ticksPerBatch: 13,
              }),
              "VERIFIED",
            );
            const verified = await h.status(client, ticket.run_id);
            assert.equal(verified.ranked, true);
            assert.equal(
              verified.score,
              String(Math.floor((state.tick * 6000) / 40000) * 10),
            );
            const out = (
              await db.pool.query(
                "SELECT state_hash,rules_hash,weekly_eligible FROM run_outcomes WHERE run_id=$1",
                [ticket.run_id],
              )
            ).rows[0];
            assert.equal(out.state_hash, await stateHash(state));
            assert.equal(out.rules_hash, ticket.versions.rules_manifest_hash);
            assert.equal(out.weekly_eligible, true);
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "lease reclaim fences old heartbeat, rejection and commit; competing claims are exclusive",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client),
              s = part(ticket);
            advance(1000);
            await h.upload(client, s);
            await h.finish(client, s);
            const a = new VerificationQueue(db.pool, clock, 1000),
              b = new VerificationQueue(db.pool, clock, 1000);
            const claims = await Promise.all([a.claim(), b.claim()]);
            assert.equal(claims.filter(Boolean).length, 1);
            const old = claims.find(Boolean)!;
            advance(1000);
            await assert.rejects(() => a.heartbeat(old), LeaseLost);
            const next = (await b.claim())!;
            assert.equal(next.generation, old.generation + 1n);
            await assert.rejects(() => a.reject(old, "STALE"), LeaseLost);
            await assert.rejects(
              () =>
                a.complete(old, {
                  score: "0",
                  distance: 0,
                  activeTicks: 60,
                  endReason: "QUIT",
                  stateHash: "a".repeat(64),
                }),
              LeaseLost,
            );
            assert.equal(await verifyLease(a, old), "LEASE_LOST");
            assert.equal(await verifyLease(b, next), "VERIFIED");
            assert.deepEqual(await counts(), { outcomes: 1, events: 1 });
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "outcome/outbox rollback atomically on injected crash; retry grants only once",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client),
              s = part(ticket);
            advance(1000);
            await h.upload(client, s);
            await h.finish(client, s);
            await db.pool.query(
              "CREATE FUNCTION qa_crash_outbox() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'qa_crash'; END $$; CREATE TRIGGER qa_crash BEFORE INSERT ON outbox_events FOR EACH ROW EXECUTE FUNCTION qa_crash_outbox()",
            );
            const queue = new VerificationQueue(db.pool, clock);
            assert.equal(await runOnce(queue), "RETRY");
            assert.deepEqual(await counts(), { outcomes: 0, events: 0 });
            assert.equal(
              (await h.status(client, ticket.run_id)).status,
              "PENDING",
            );
            assert.equal(await runOnce(queue), "IDLE");
            await db.pool.query(
              "DROP TRIGGER qa_crash ON outbox_events; DROP FUNCTION qa_crash_outbox()",
            );
            advance(1000);
            assert.equal(await runOnce(queue), "VERIFIED");
            assert.deepEqual(await counts(), { outcomes: 1, events: 1 });
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "cancellation preserves PENDING and retry; repeated crashes reach a dead letter",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client),
              s = part(ticket);
            advance(1000);
            await h.upload(client, s);
            await h.finish(client, s);
            const queue = new VerificationQueue(db.pool, clock, 1000, 2),
              controller = new AbortController();
            assert.equal(
              await runOnce(queue, {
                ticksPerBatch: 5,
                signal: controller.signal,
                onBatch: () => controller.abort(),
              }),
              "RETRY",
            );
            assert.deepEqual(await counts(), { outcomes: 0, events: 0 });
            advance(1000);
            const crashed = (await queue.claim())!;
            assert.equal(crashed.generation, 2n);
            advance(1000);
            assert.equal(await queue.claim(), null);
            assert.equal(
              (await h.status(client, ticket.run_id)).rejection_code,
              "VERIFIER_UNAVAILABLE",
            );
            assert.deepEqual(await counts(), { outcomes: 0, events: 0 });
            assert.equal(
              (
                await db.pool.query(
                  "SELECT state FROM run_verification_jobs WHERE run_id=$1",
                  [ticket.run_id],
                )
              ).rows[0].state,
              "FAILED",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "72h finish, 24h upload deadlines and active/wall time are enforced by server clock",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client);
            const tooFast = part(ticket, 1000);
            assert.equal((await h.upload(client, tooFast)).statusCode, 422);
            advance(72 * 3600000);
            const s = part(ticket, 60);
            const finish = await h.finish(client, s);
            assert.equal(finish.statusCode, 202);
            assert.equal(finish.json().status, "AWAITING_SEGMENTS");
            advance(86400000);
            assert.equal((await h.upload(client, s)).statusCode, 201);
            assert.equal(
              (await h.status(client, ticket.run_id)).status,
              "PENDING",
            );
            const expired = await h.start(client);
            advance(72 * 3600000 + 1);
            assert.equal(
              (await h.finish(client, part(expired))).statusCode,
              422,
            );
            assert.equal(
              (await h.status(client, expired.run_id)).status,
              "EXPIRED",
            );
            const missing = await h.start(client);
            await h.finish(client, part(missing, 0));
            advance(86400001);
            assert.equal(
              (await h.upload(client, part(missing, 0))).statusCode,
              422,
            );
            assert.equal(
              (await h.status(client, missing.run_id)).status,
              "EXPIRED",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "storage/active quotas and shared rate buckets survive a second API instance",
        async () => {
          await reset();
          const h = harness(db.pool, clock, {
              ...DEFAULT_POLICY,
              max_run_encoded_bytes: 1,
              max_active_runs: 1,
            }),
            other = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client);
            assert.equal(
              (await h.upload(client, part(ticket))).statusCode,
              429,
            );
            assert.equal(
              (
                await h.api.inject({
                  method: "POST",
                  url: "/api/v1/runs/start",
                  headers: {
                    ...h.headers(client),
                    "idempotency-key": randomUUID(),
                  },
                  payload: { mode: "FULL" },
                })
              ).statusCode,
              429,
            );
            for (let i = 0; i < 19; i++)
              assert.equal(
                (
                  await h.api.inject({
                    method: "POST",
                    url: "/api/v1/auth/guest",
                    headers: h.headers(client),
                    payload: {},
                  })
                ).statusCode,
                200,
              );
            const limited = await other.api.inject({
              method: "POST",
              url: "/api/v1/auth/guest",
              headers: other.headers(client),
              payload: {},
            });
            assert.equal(limited.statusCode, 429);
            assert.equal(limited.headers["retry-after"], "60");
          } finally {
            await h.api.close();
            await other.api.close();
          }
        },
      );
      await t.test(
        "manifest hash is checked and older numeric rules remain bound to their run",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              old = {
                ...FOUNDATION_MANIFEST,
                rules_patch: 1,
                physics: { ...FOUNDATION_MANIFEST.physics, gravity: 2000000 },
              };
            const runs = new Runs(db.pool, clock, undefined, old),
              started = await runs.start(
                client.playerId,
                { mode: "FULL" },
                randomUUID(),
              ),
              s = part(started.ticket, 60);
            assert.equal(
              started.ticket.versions.rules_manifest_hash,
              await manifestHash(old),
            );
            assert.notEqual(
              started.ticket.versions.rules_manifest_hash,
              await manifestHash(FOUNDATION_MANIFEST),
            );
            await assert.rejects(
              () =>
                loadManifest(
                  old,
                  started.ticket.versions.rules_manifest_hash.replace(
                    /^./,
                    (ch) => (ch === "a" ? "b" : "a"),
                  ),
                ),
              /manifest_hash_mismatch/,
            );
            advance(1000);
            await h.upload(client, s);
            await h.finish(client, s);
            assert.equal(
              await runOnce(new VerificationQueue(db.pool, clock)),
              "VERIFIED",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "weekly cutoff uses complete upload time, not worker completion time",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            now = Date.parse("2026-11-22T23:59:00Z");
            const client = await h.guest(),
              ticket = await h.start(client);
            let state = createState(ticket.seed);
            const world = primitiveCourse(ticket.seed, 0, 3000000);
            while (state.status === "RUNNING")
              state = step(state, [], world).state;
            const s = part(ticket, state.tick, false);
            advance(10000);
            await h.finish(client, s, "ABYSS");
            now = Date.parse("2026-11-23T23:59:00Z");
            assert.equal((await h.upload(client, s)).statusCode, 201);
            now = Date.parse("2026-11-25T00:00:00Z");
            assert.equal(
              await runOnce(new VerificationQueue(db.pool, clock)),
              "VERIFIED",
            );
            assert.equal(
              (
                await db.pool.query(
                  "SELECT weekly_eligible FROM run_outcomes WHERE run_id=$1",
                  [ticket.run_id],
                )
              ).rows[0].weekly_eligible,
              true,
            );
            assert.equal(
              weekWindow(new Date("2026-11-23T00:00:00Z")).start.toISOString(),
              "2026-11-23T00:00:00.000Z",
            );
          } finally {
            await h.api.close();
          }
        },
      );

      await t.test(
        "one hundred durable control segments preserve chain/order without scoring paused time",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client),
              parts: ReplaySegment[] = [];
            let previous: string | null = null;
            for (let i = 0; i <= 100; i++) {
              const segment: ReplaySegment = {
                ...part(ticket, 0),
                index: i,
                previous_hash: previous,
                controls:
                  i === 100
                    ? [{ tick: 0, sequence: 200, action: "QUIT" }]
                    : [
                        { tick: 0, sequence: i * 2, action: "PAUSE" },
                        { tick: 0, sequence: i * 2 + 1, action: "RESUME" },
                      ],
              };
              parts.push(segment);
              previous = await segmentHash(segment);
            }
            assert.equal(
              (await h.finish(client, parts[100]!)).json().status,
              "AWAITING_SEGMENTS",
            );
            for (const segment of [...parts].reverse())
              assert.equal((await h.upload(client, segment)).statusCode, 201);
            assert.equal(
              await runOnce(new VerificationQueue(db.pool, clock)),
              "VERIFIED",
            );
            const status = await h.status(client, ticket.run_id);
            assert.equal(status.score, "0");
            assert.equal(status.distance_m, 0);
            assert.equal(status.ranked, false);
            assert.equal(
              (
                await db.pool.query(
                  "SELECT count(*) FROM run_segments WHERE run_id=$1",
                  [ticket.run_id],
                )
              ).rows[0].count,
              "101",
            );
            assert.deepEqual(await counts(), { outcomes: 1, events: 1 });
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "independent workers claim different jobs and commit without duplicate outcomes",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              a = await h.start(client),
              b = await h.start(client);
            advance(1000);
            for (const ticket of [a, b]) {
              const s = part(ticket);
              await h.upload(client, s);
              await h.finish(client, s);
            }
            const qa = new VerificationQueue(db.pool, clock),
              qb = new VerificationQueue(db.pool, clock),
              leases = await Promise.all([qa.claim(), qb.claim()]);
            assert.ok(leases[0]);
            assert.ok(leases[1]);
            assert.notEqual(leases[0].jobId, leases[1].jobId);
            assert.deepEqual(
              await Promise.all([
                verifyLease(qa, leases[0]),
                verifyLease(qb, leases[1]),
              ]),
              ["VERIFIED", "VERIFIED"],
            );
            assert.deepEqual(await counts(), { outcomes: 2, events: 2 });
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "real HP_ZERO with successful gap jumps verifies all three damage events",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client),
              world = primitiveCourse(ticket.seed, 0, 6000000),
              actions: ReplaySegment["actions"] = [];
            const jumpTicks = new Set(
              world.gaps.map((g) => Math.floor((g.start - 60000) / 6000)),
            );
            let state = createState(ticket.seed),
              damage = 0;
            while (state.status === "RUNNING" && state.tick < 600) {
              const jump = jumpTicks.has(state.tick);
              if (jump) actions.push({ tick: state.tick, action: "JUMP" });
              const update = step(state, jump ? ["JUMP"] : [], world);
              damage += update.events.filter((e) => e.type === "DAMAGE").length;
              state = update.state;
            }
            assert.equal(state.endReason, "HP_ZERO");
            assert.equal(damage, 3);
            assert.equal(state.hp, 0);
            const s = { ...part(ticket, state.tick, false), actions };
            advance(20000);
            await h.upload(client, s);
            await h.finish(client, s, "HP_ZERO");
            assert.equal(
              await runOnce(new VerificationQueue(db.pool, clock), {
                ticksPerBatch: 11,
              }),
              "VERIFIED",
            );
            assert.equal((await h.status(client, ticket.run_id)).ranked, true);
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "inconsistent completed metadata is rejected; existing extra parts cannot be truncated by finish",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client);
            advance(2000);
            const first = part(ticket, 30, false),
              last = {
                ...part(ticket, 60),
                index: 1,
                start_tick: 30,
                previous_hash: "a".repeat(64),
              };
            await h.upload(client, first);
            await h.upload(client, last);
            assert.equal((await h.finish(client, first)).statusCode, 409);
            const closed = await h.finish(client, last);
            assert.equal(closed.json().status, "REJECTED");
            assert.equal(
              (
                await db.pool.query(
                  "SELECT count(*) FROM run_verification_jobs",
                )
              ).rows[0].count,
              "0",
            );
            assert.deepEqual(await counts(), { outcomes: 0, events: 0 });
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "expired guest cookie is not silently replaced with a different identity",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest();
            advance(90 * 86400000 + 1);
            const response = await h.api.inject({
              method: "POST",
              url: "/api/v1/auth/guest",
              headers: h.headers(client),
              payload: {},
            });
            assert.equal(response.statusCode, 401);
            assert.equal(
              (await db.pool.query("SELECT count(*) FROM players")).rows[0]
                .count,
              "1",
            );
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "weekly grace end is exclusive even if upload still meets its personal deadline",
        async () => {
          await reset();
          now = Date.parse("2026-11-22T23:59:55Z");
          const h = harness(db.pool, clock);
          try {
            const client = await h.guest(),
              ticket = await h.start(client);
            let state = createState(ticket.seed);
            const world = primitiveCourse(ticket.seed, 0, 3000000);
            while (state.status === "RUNNING")
              state = step(state, [], world).state;
            const s = part(ticket, state.tick, false);
            advance(15000);
            await h.finish(client, s, "ABYSS");
            now = Date.parse("2026-11-24T00:00:00Z");
            assert.equal((await h.upload(client, s)).statusCode, 201);
            assert.equal(
              await runOnce(new VerificationQueue(db.pool, clock)),
              "VERIFIED",
            );
            assert.equal(
              (
                await db.pool.query(
                  "SELECT weekly_eligible FROM run_outcomes WHERE run_id=$1",
                  [ticket.run_id],
                )
              ).rows[0].weekly_eligible,
              false,
            );
            assert.equal((await h.status(client, ticket.run_id)).ranked, true);
          } finally {
            await h.api.close();
          }
        },
      );
      await t.test(
        "real HTTP start/upload/finish/status and independent verifier process complete a run",
        async () => {
          await reset();
          const h = harness(db.pool, clock);
          try {
            const address = await h.api.listen({ host: "127.0.0.1", port: 0 });
            const send = (
              method: string,
              path: string,
              payload: Buffer | undefined,
              headers: Record<string, string> = {},
            ) =>
              new Promise<{
                status: number;
                body: string;
                headers: import("node:http").IncomingHttpHeaders;
              }>((resolve, reject) => {
                const request = httpRequest(
                  address + path,
                  { method, headers: { ...h.base, ...headers } },
                  (res) => {
                    let body = "";
                    res.setEncoding("utf8");
                    res.on("data", (chunk) => {
                      body += String(chunk);
                    });
                    res.on("end", () =>
                      resolve({
                        status: res.statusCode!,
                        body,
                        headers: res.headers,
                      }),
                    );
                    res.on("error", reject);
                  },
                );
                request.on("error", reject);
                request.end(payload);
              });
            const guest = await send(
              "POST",
              "/api/v1/auth/guest",
              Buffer.from("{}"),
              { "content-type": "application/json" },
            );
            assert.equal(guest.status, 201, guest.body);
            const auth = {
              cookie: guest.headers["set-cookie"]![0]!.split(";")[0]!,
              "x-csrf-token": String(guest.headers["x-csrf-token"]),
            };
            const started = await send(
              "POST",
              "/api/v1/runs/start",
              Buffer.from('{"mode":"FULL"}'),
              {
                ...auth,
                "content-type": "application/json",
                "idempotency-key": randomUUID(),
              },
            );
            assert.equal(started.status, 201, started.body);
            const ticket = JSON.parse(started.body) as { run_id: string },
              segment = part(ticket, 0),
              hash = await segmentHash(segment);
            const upload = await send(
              "PUT",
              `/api/v1/runs/${ticket.run_id}/segments/0`,
              Buffer.from(encodeSegment(segment)),
              {
                ...auth,
                "content-type": "application/octet-stream",
                "x-start-tick": "0",
                "x-end-tick": "0",
                "x-segment-hash": hash,
              },
            );
            assert.equal(upload.status, 201, upload.body);
            const finish = await send(
              "POST",
              `/api/v1/runs/${ticket.run_id}/finish`,
              Buffer.from(
                JSON.stringify({
                  final_segment_index: 0,
                  final_tick: 0,
                  final_hash: hash,
                  end_reason: "QUIT",
                }),
              ),
              { ...auth, "content-type": "application/json" },
            );
            assert.equal(finish.status, 202, finish.body);
            assert.equal(JSON.parse(finish.body).status, "PENDING");
            const result = await new Promise<string>((resolve, reject) => {
              const child = fork(
                new URL("./fixtures/verifier-process.ts", import.meta.url),
                [],
                { silent: true },
              );
              let outcome = "";
              const timeout = setTimeout(() => {
                child.kill();
                reject(new Error("qa_worker_process_timeout"));
              }, 30000);
              child.on("error", reject);
              child.on("message", (value: unknown) => {
                outcome = (value as { result: string }).result;
              });
              child.on("exit", (code) => {
                clearTimeout(timeout);
                if (code !== 0) reject(new Error("qa_worker_process_failed"));
                else resolve(outcome);
              });
              child.send({ port: db.port, password: db.pool.options.password });
            });
            assert.equal(result, "VERIFIED");
            const status = await send(
              "GET",
              `/api/v1/runs/${ticket.run_id}`,
              undefined,
              auth,
            );
            assert.equal(status.status, 200, status.body);
            const outcome = JSON.parse(status.body) as {
              status: string;
              score: string;
              ranked: boolean;
            };
            assert.equal(outcome.status, "VERIFIED");
            assert.equal(outcome.score, "0");
            assert.equal(outcome.ranked, false);
            assert.deepEqual(await counts(), { outcomes: 1, events: 1 });
          } finally {
            await h.api.close();
          }
        },
      );
    } finally {
      await db.close();
    }
  },
);

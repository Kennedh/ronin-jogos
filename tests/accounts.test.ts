import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testPostgres } from "./helpers/postgres.ts";
import { harness } from "./helpers/runtime.ts";
import type { Client } from "./helpers/runtime.ts";
import {
  migrate,
  deliverAuthMail,
  VerificationQueue,
  PasswordHasher,
  Sessions,
  transaction,
  passwordPolicy,
} from "@ronin/data";
import type { AuthMail } from "@ronin/data";
import { BOSS_MANIFEST } from "@ronin/content/runner-manifest";
import { RULES_V4, control } from "@ronin/runner-core";
import { bossRun } from "./fixtures/boss-run.ts";
import { segmentHash } from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
import { runOnce } from "@ronin/verifier";
import { validate } from "@ronin/contracts";
const secret = "a long synthetic passphrase 2026";
test("5A: Argon2id random salts, Unicode/long passwords and bounded async verification", async () => {
  const hasher = new PasswordHasher(),
    a = await hasher.hash(secret),
    b = await hasher.hash(secret);
  assert.notDeepEqual(a.salt, b.salt);
  assert.notDeepEqual(a.digest, b.digest);
  assert.equal(await hasher.verify(secret, a), true);
  assert.equal(await hasher.verify("wrong", a), false);
  assert.equal(await hasher.verify(secret), false);
  const unicode = "春風と雪の道を静かに歩いています " + "🙂".repeat(110);
  passwordPolicy(unicode);
  const r = await hasher.hash(unicode);
  assert.equal(await hasher.verify(unicode, r), true);
  assert.equal(await hasher.verify(unicode.trim() + " ", r), false);
  assert.throws(() => passwordPolicy("123456789012"));
  assert.throws(() => passwordPolicy("x".repeat(257)));
  let yielded = false;
  const hashes = Promise.all(
    Array.from({ length: 5 }, () => hasher.hash(secret)),
  );
  await new Promise<void>((resolve) =>
    setImmediate(() => {
      yielded = true;
      resolve();
    }),
  );
  await hashes;
  assert.equal(yielded, true);
});
test(
  "RR-AUTH-002/004: real email proof, visitor progress, reset, sessions and abuse boundaries",
  { timeout: 180000 },
  async (t) => {
    const db = await testPostgres();
    await migrate(db.pool);
    let now = Date.parse("2026-11-18T12:00:00Z");
    const key = Buffer.alloc(32, 42),
      h = harness(db.pool, () => new Date(now), undefined, BOSS_MANIFEST, key),
      mails = new Map<string, AuthMail>();
    const send = async () => {
      for (let n = 0; n < 20; n++) {
        const r = await deliverAuthMail(
          db.pool,
          key,
          {
            async send(id, m) {
              mails.set(id, m);
            },
          },
          () => new Date(now),
        );
        if (r === "IDLE") return;
      }
      throw new Error("mail_drain_budget");
    };
    const mail = (email: string, purpose: "VERIFY" | "RESET") => {
      const items = [...mails.values()].filter(
        (m) => m.to === email && m.purpose === purpose,
      );
      assert.ok(items.length);
      return items.at(-1)!;
    };
    const token = (m: AuthMail) =>
      new URLSearchParams(new URL(m.link).hash.slice(1)).get(
        m.purpose === "VERIFY" ? "verify" : "reset",
      )!;
    const rotate = (
      c: Client,
      response: { headers: Record<string, unknown> },
    ) => {
      c.cookie = String(response.headers["set-cookie"]).split(";")[0]!;
      c.csrf = String(response.headers["x-csrf-token"]);
    };
    const post = (path: string, payload: Record<string, unknown>, c?: Client) =>
      h.api.inject({
        method: "POST",
        url: "/api/v1" + path,
        headers: {
          host: "play.ronin.dev.br",
          origin: "https://play.ronin.dev.br",
          "x-ronin-auth": "1",
          ...(c ? h.headers(c) : {}),
        },
        payload,
      });
    const me = (c: Client) =>
      h.api.inject({ url: "/api/v1/me", headers: h.headers(c) });
    try {
      const owner = await h.guest("pt-BR"),
        originalId = owner.playerId,
        oldCookie = { ...owner };
      await t.test(
        "guest earns Aurora in the real verifier before registration",
        async () => {
          const ticket = await h.start(owner),
            run = bossRun(ticket.seed, RULES_V4, 320000000),
            state = control(run.state, "QUIT");
          now += Math.ceil((state.tick / 60) * 1000) + 1000;
          let hash: string | null = null,
            index = 0;
          for (let start = 0; start < state.tick; start += 3600) {
            const end = Math.min(state.tick, start + 3600),
              s: ReplaySegment = {
                protocol: "rr-input-v1",
                run_id: ticket.run_id,
                index: index++,
                start_tick: start,
                end_tick: end,
                previous_hash: hash,
                actions: run.commands.filter(
                  (c) => c.tick >= start && c.tick < end,
                ),
                controls:
                  end === state.tick
                    ? [{ tick: end, sequence: 0, action: "QUIT" }]
                    : [],
              };
            assert.equal((await h.upload(owner, s)).statusCode, 201);
            hash = await segmentHash(s);
          }
          assert.ok(
            [200, 202].includes(
              (
                await post(
                  `/runs/${ticket.run_id}/finish`,
                  {
                    final_segment_index: index - 1,
                    final_tick: state.tick,
                    final_hash: hash,
                    end_reason: "QUIT",
                  },
                  owner,
                )
              ).statusCode,
            ),
          );
          assert.equal(
            await runOnce(new VerificationQueue(db.pool, () => new Date(now))),
            "VERIFIED",
          );
          assert.equal(
            (
              await db.pool.query(
                "SELECT count(*) AS n FROM player_rewards WHERE player_id=$1 AND reward_id='AURORA_TRAIL'",
                [owner.playerId],
              )
            ).rows[0].n,
            "1",
          );
        },
      );
      await t.test(
        "pending registration does not activate credentials; tokens encrypted in durable mail",
        async () => {
          const r = await post(
            "/auth/register",
            {
              email: " Owner@Example.test ".trim(),
              password: secret,
              nickname: "Test Ronin",
            },
            owner,
          );
          assert.equal(r.statusCode, 202, r.body);
          assert.deepEqual(r.json(), { status: "ACCEPTED" });
          assert.equal(
            (await me(owner)).json().account_status,
            "EMAIL_PENDING",
          );
          assert.equal(
            (
              await post("/auth/login", {
                email: "owner@example.test",
                password: secret,
              })
            ).statusCode,
            401,
          );
          const count = await db.pool.query(
            "SELECT count(*) AS n FROM password_credentials",
          );
          assert.equal(count.rows[0].n, "0");
          await send();
          const m = mail("owner@example.test", "VERIFY");
          assert.equal(m.locale, "pt-BR");
          assert.match(m.subject, /Confirme/);
          assert.equal(new URL(m.link).search, "");
          assert.equal(token(m).length, 43);
          const out = (
            await db.pool.query(
              "SELECT ciphertext FROM auth_mail_outbox LIMIT 1",
            )
          ).rows[0].ciphertext as Buffer;
          assert.equal(out.includes(Buffer.from(token(m))), false);
          assert.equal(
            (await db.pool.query("SELECT digest FROM account_tokens LIMIT 1"))
              .rows[0].digest.length,
            32,
          );
          const before = mails.size;
          assert.equal(
            (await post("/auth/verify-email/resend", {}, owner)).statusCode,
            202,
          );
          await send();
          assert.equal(mails.size, before);
        },
      );
      let verification = "";
      await t.test(
        "context binding, resend invalidation, confirmation rotation and immutable visitor identity",
        async () => {
          verification = token(mail("owner@example.test", "VERIFY"));
          const other = await h.guest();
          assert.equal(
            (await post("/auth/verify-email", { token: verification }, other))
              .statusCode,
            403,
          );
          now += 61000;
          assert.equal(
            (await post("/auth/verify-email/resend", {}, owner)).statusCode,
            202,
          );
          await send();
          const fresh = token(mail("owner@example.test", "VERIFY"));
          assert.notEqual(fresh, verification);
          assert.equal(
            (await post("/auth/verify-email", { token: verification }, owner))
              .statusCode,
            422,
          );
          const r = await post("/auth/verify-email", { token: fresh }, owner);
          assert.equal(r.statusCode, 204, r.body);
          rotate(owner, r);
          assert.equal((await me(oldCookie)).statusCode, 401);
          const summary = (await me(owner)).json();
          assert.equal(summary.player_id, originalId);
          assert.equal(summary.account_status, "REGISTERED");
          assert.equal(summary.email_verified, true);
          assert.equal(summary.email, "owner@example.test");
          assert.equal(validate("PlayerSummary", summary), true);
          assert.equal(
            (await post("/auth/verify-email", { token: fresh }, owner))
              .statusCode,
            422,
          );
          assert.equal(
            (
              await db.pool.query(
                "SELECT count(*) AS n FROM player_boss_seals WHERE player_id=$1",
                [originalId],
              )
            ).rows[0].n,
            "4",
          );
          assert.equal(
            (
              await db.pool.query(
                "SELECT count(*) AS n FROM player_rewards WHERE player_id=$1 AND reward_id='AURORA_TRAIL'",
                [originalId],
              )
            ).rows[0].n,
            "1",
          );
          assert.match(String(r.headers["set-cookie"]), /HttpOnly/);
          assert.match(String(r.headers["set-cookie"]), /Secure/);
          assert.doesNotMatch(String(r.headers["set-cookie"]), /Domain=/);
        },
      );
      let second: Client;
      await t.test(
        "login rotates sessions, missing-user failures are generic, and lifetime is 30 days",
        async () => {
          const wrong = await post("/auth/login", {
              email: "owner@example.test",
              password: "wrong",
            }),
            unknown = await post("/auth/login", {
              email: "missing@example.test",
              password: "wrong",
            });
          assert.equal(wrong.statusCode, 401);
          assert.equal(unknown.statusCode, 401);
          assert.equal(wrong.json().error.code, unknown.json().error.code);
          const r = await post("/auth/login", {
            email: "OWNER@example.test",
            password: secret,
          });
          assert.equal(r.statusCode, 200, r.body);
          second = { cookie: "", csrf: "", playerId: originalId };
          rotate(second, r);
          assert.notEqual(second.cookie, owner.cookie);
          const row = (
            await db.pool.query(
              "SELECT created_at,expires_at FROM sessions WHERE id=$1",
              [second.cookie.split("=")[1]!.split(".")[0]],
            )
          ).rows[0];
          assert.equal(
            row.expires_at.getTime() - row.created_at.getTime(),
            30 * 86400000,
          );
        },
      );
      await t.test(
        "recent reauthentication, private session list and owner-only revocation",
        async () => {
          const list = await h.api.inject({
            url: "/api/v1/me/sessions",
            headers: h.headers(owner),
          });
          assert.equal(list.statusCode, 200, list.body);
          assert.equal(validate("AccountSessions", list.json()), true);
          assert.equal(list.json().sessions.length, 2);
          assert.equal(
            JSON.stringify(list.json()).includes("verifier_digest"),
            false,
          );
          const other = await h.guest(),
            foreign = other.cookie.split("=")[1]!.split(".")[0]!;
          assert.equal(
            (
              await h.api.inject({
                method: "DELETE",
                url: "/api/v1/me/sessions/" + foreign,
                headers: h.headers(owner),
              })
            ).statusCode,
            403,
          );
          now += 600001;
          assert.equal(
            (
              await h.api.inject({
                url: "/api/v1/me/sessions",
                headers: h.headers(owner),
              })
            ).statusCode,
            403,
          );
          assert.equal(
            (await post("/auth/reauth", { password: secret }, owner))
              .statusCode,
            204,
          );
          const id = second.cookie.split("=")[1]!.split(".")[0]!;
          assert.equal(
            (
              await h.api.inject({
                method: "DELETE",
                url: "/api/v1/me/sessions/" + id,
                headers: h.headers(owner),
              })
            ).statusCode,
            204,
          );
          assert.equal((await me(second)).statusCode, 401);
        },
      );
      await t.test(
        "duplicate email registration does not enumerate, overwrite or merge verified identities",
        async () => {
          now += 61000;
          const visitor = await h.guest(),
            r = await post(
              "/auth/register",
              {
                email: "owner@example.test",
                password: "a different secure phrase",
                nickname: "Other Visitor",
              },
              visitor,
            );
          assert.equal(r.statusCode, 202);
          assert.deepEqual(r.json(), { status: "ACCEPTED" });
          assert.equal(
            (await me(visitor)).json().account_status,
            "EMAIL_PENDING",
          );
          await send();
          assert.equal(
            (
              await post(
                "/auth/verify-email",
                { token: token(mail("owner@example.test", "VERIFY")) },
                visitor,
              )
            ).statusCode,
            409,
          );
          assert.notEqual(visitor.playerId, originalId);
          const victim = await h.guest();
          await h.start(victim);
          const denied = await post(
            "/auth/login",
            { email: "owner@example.test", password: secret },
            victim,
          );
          assert.equal(denied.statusCode, 409);
          assert.equal(
            denied.json().error.code,
            "GUEST_PROGRESS_REQUIRES_LINK",
          );
          assert.equal((await me(victim)).json().player_id, victim.playerId);
        },
      );
      await t.test(
        "recovery responses are generic; reset is single-use, expires and revokes all sessions",
        async () => {
          now += 61000;
          const known = await post("/auth/password/forgot", {
              email: "owner@example.test",
            }),
            unknown = await post("/auth/password/forgot", {
              email: "absent@example.test",
            });
          assert.equal(known.statusCode, 202);
          assert.equal(unknown.statusCode, 202);
          assert.deepEqual(known.json(), unknown.json());
          await send();
          const reset = token(mail("owner@example.test", "RESET"));
          assert.equal(
            (
              await post("/auth/password/reset", {
                token: verification,
                new_password: "a revised synthetic passphrase",
              })
            ).statusCode,
            422,
          );
          const r = await post("/auth/password/reset", {
            token: reset,
            new_password: "a revised synthetic passphrase",
          });
          assert.equal(r.statusCode, 204, r.body);
          assert.equal(r.headers["set-cookie"], undefined);
          assert.equal((await me(owner)).statusCode, 401);
          assert.equal(
            (
              await post("/auth/password/reset", {
                token: reset,
                new_password: secret,
              })
            ).statusCode,
            422,
          );
          assert.equal(
            (
              await post("/auth/login", {
                email: "owner@example.test",
                password: secret,
              })
            ).statusCode,
            401,
          );
          const login = await post("/auth/login", {
            email: "owner@example.test",
            password: "a revised synthetic passphrase",
          });
          assert.equal(login.statusCode, 200);
          rotate(owner, login);
          now += 61000;
          await post("/auth/password/forgot", { email: "owner@example.test" });
          await send();
          const expired = token(mail("owner@example.test", "RESET"));
          now += 1800001;
          assert.equal(
            (
              await post("/auth/password/reset", {
                token: expired,
                new_password: secret,
              })
            ).statusCode,
            422,
          );
        },
      );
      await t.test(
        "strict bodies, CSRF/origin and durable mail retry protect all entry points",
        async () => {
          assert.equal(
            (
              await h.api.inject({
                method: "POST",
                url: "/api/v1/auth/login",
                headers: {
                  host: "play.ronin.dev.br",
                  origin: "https://evil.test",
                  "x-ronin-auth": "1",
                },
                payload: { email: "owner@example.test", password: secret },
              })
            ).statusCode,
            403,
          );
          assert.equal(
            (
              await h.api.inject({
                method: "POST",
                url: "/api/v1/auth/login",
                headers: {
                  host: "play.ronin.dev.br",
                  origin: "https://play.ronin.dev.br",
                },
                payload: { email: "owner@example.test", password: secret },
              })
            ).statusCode,
            403,
          );
          assert.equal(
            (
              await h.api.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                headers: { ...h.headers(owner), "x-csrf-token": "wrong" },
                payload: {
                  email: "x@example.test",
                  password: secret,
                  nickname: "Valid Name",
                },
              })
            ).statusCode,
            403,
          );
          assert.equal(
            (
              await post(
                "/auth/register",
                {
                  email: "x@example.test",
                  password: secret,
                  nickname: "Valid Name",
                  player_id: randomUUID(),
                },
                owner,
              )
            ).statusCode,
            422,
          );
          now += 61000;
          await post("/auth/password/forgot", { email: "owner@example.test" });
          let sent = 0;
          const seen = new Set();
          const transport = {
            async send(id: string) {
              seen.add(id);
              if (sent++ === 0)
                throw new Error("synthetic_after_delivery_crash");
            },
          };
          assert.equal(
            await deliverAuthMail(db.pool, key, transport, () => new Date(now)),
            "RETRY",
          );
          now += 2000;
          assert.equal(
            await deliverAuthMail(db.pool, key, transport, () => new Date(now)),
            "SENT",
          );
          assert.equal(seen.size, 1);
          assert.equal((await post("/auth/logout", {}, owner)).statusCode, 204);
          assert.equal((await me(owner)).statusCode, 401);
        },
      );
      await t.test(
        "expired confirmation can be renewed; concurrent proof has exactly one winner",
        async () => {
          now += 61000;
          const visitor = await h.guest();
          assert.equal(
            (
              await post(
                "/auth/register",
                {
                  email: "expiry@example.test",
                  password: secret,
                  nickname: "Expiry Visitor",
                },
                visitor,
              )
            ).statusCode,
            202,
          );
          await send();
          const expired = token(mail("expiry@example.test", "VERIFY"));
          now += 86400001;
          assert.equal(
            (await post("/auth/verify-email", { token: expired }, visitor))
              .statusCode,
            422,
          );
          assert.equal(
            (await post("/auth/verify-email/resend", {}, visitor)).statusCode,
            202,
          );
          await send();
          const fresh = token(mail("expiry@example.test", "VERIFY"));
          const results = await Promise.all([
            post("/auth/verify-email", { token: fresh }, visitor),
            post("/auth/verify-email", { token: fresh }, visitor),
          ]);
          assert.equal(results.filter((r) => r.statusCode === 204).length, 1);
          assert.ok(
            results.every((r) => [204, 401, 422].includes(r.statusCode)),
          );
          assert.equal(
            (
              await db.pool.query(
                "SELECT count(*) AS n FROM email_accounts WHERE player_id=$1",
                [visitor.playerId],
              )
            ).rows[0].n,
            "1",
          );
        },
      );
      await t.test(
        "mail enqueue failure rolls back pending identity and secrets atomically",
        async () => {
          now += 61000;
          const visitor = await h.guest();
          await db.pool.query(
            "CREATE FUNCTION qa_auth_rollback() RETURNS trigger LANGUAGE plpgsql AS $f$ BEGIN RAISE EXCEPTION 'qa_auth_rollback'; END $f$; CREATE TRIGGER qa_auth_rollback BEFORE INSERT ON auth_mail_outbox FOR EACH ROW EXECUTE FUNCTION qa_auth_rollback()",
          );
          try {
            assert.equal(
              (
                await post(
                  "/auth/register",
                  {
                    email: "rollback@example.test",
                    password: secret,
                    nickname: "Rollback Visitor",
                  },
                  visitor,
                )
              ).statusCode,
              500,
            );
            assert.equal((await me(visitor)).json().account_status, "GUEST");
            assert.equal(
              (
                await db.pool.query(
                  "SELECT count(*) AS n FROM email_registrations WHERE player_id=$1",
                  [visitor.playerId],
                )
              ).rows[0].n,
              "0",
            );
            assert.equal(
              (
                await db.pool.query(
                  "SELECT count(*) AS n FROM account_tokens WHERE player_id=$1",
                  [visitor.playerId],
                )
              ).rows[0].n,
              "0",
            );
          } finally {
            await db.pool.query(
              "DROP TRIGGER qa_auth_rollback ON auth_mail_outbox; DROP FUNCTION qa_auth_rollback()",
            );
          }
        },
      );
      await t.test(
        "simultaneous session timestamps keep the new session and cap active sessions at twenty",
        async () => {
          const sessions = new Sessions(db.pool, () => new Date(now));
          let latest = "";
          for (let n = 0; n < 25; n++) {
            const issued = await transaction(db.pool, async (db) => {
              await db.query("SELECT id FROM players WHERE id=$1 FOR UPDATE", [
                originalId,
              ]);
              return sessions.issue(db, originalId, "pt-BR", new Date(now));
            });
            latest = issued.token;
            assert.equal((await sessions.read(latest)).playerId, originalId);
          }
          const count = await db.pool.query(
            "SELECT count(*) AS n FROM sessions WHERE player_id=$1 AND revoked_at IS NULL",
            [originalId],
          );
          assert.equal(count.rows[0].n, "20");
          const auth = await sessions.read(latest);
          const malformed = await post(
            "/auth/logout",
            { extra: true },
            {
              playerId: originalId,
              cookie: "__Host-rr_sid=" + latest,
              csrf: auth.csrfToken,
            },
          );
          assert.equal(malformed.statusCode, 422);
          assert.equal((await sessions.read(latest)).playerId, originalId);
          now += 61000;
          const stale = {
            playerId: originalId,
            cookie: "__Host-rr_sid=" + latest,
            csrf: auth.csrfToken,
          };
          await db.pool.query("UPDATE sessions SET revoked_at=$2 WHERE id=$1", [
            auth.sessionId,
            new Date(now),
          ]);
          const cleared = await post("/auth/logout", {}, stale);
          assert.equal(cleared.statusCode, 204);
          assert.match(String(cleared.headers["set-cookie"]), /Max-Age=0/);
        },
      );
      await t.test(
        "failed password attempts are rate limited equally for known and unknown addresses",
        async () => {
          now += 61000;
          for (const email of ["owner@example.test", "nobody@example.test"]) {
            for (let n = 0; n < 10; n++)
              assert.equal(
                (await post("/auth/login", { email, password: "wrong" }))
                  .statusCode,
                401,
              );
            assert.equal(
              (await post("/auth/login", { email, password: "wrong" }))
                .statusCode,
              429,
            );
          }
        },
      );
    } finally {
      await h.api.close();
      await db.close();
    }
  },
);

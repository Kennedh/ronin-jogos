import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deliverAuthMail,
  migrate,
  Privacy,
  VerificationQueue,
} from "@ronin/data";
import { runOnce } from "@ronin/verifier";
import { validate } from "@ronin/contracts";
import { harness, part } from "./helpers/runtime.ts";
import type { Client } from "./helpers/runtime.ts";
import { testPostgres } from "./helpers/postgres.ts";
import { syntheticGoogle } from "./helpers/google.ts";

test(
  "Ronin ID privacy: private export pages, reversible deletion and audited nickname review",
  { timeout: 120000 },
  async () => {
    const db = await testPostgres();
    let now = Date.now();
    const clock = () => new Date(now),
      key = Buffer.alloc(32, 43);
    const h = harness(db.pool, clock, undefined, undefined, key);
    const privacy = new Privacy(db.pool, clock);
    const email = "privacy@example.test",
      password = "fixture privacy password";
    const request = (
      method: "GET" | "POST" | "PATCH" | "DELETE",
      path: string,
      client: Client,
      payload?: Record<string, unknown>,
    ) =>
      h.api.inject({
        method,
        url: "/api/v1" + path,
        headers: { ...h.headers(client), "x-ronin-auth": "1" },
        ...(payload === undefined ? {} : { payload }),
      });
    const rotate = (
      before: Client,
      response: Awaited<ReturnType<typeof request>>,
    ): Client => ({
      ...before,
      cookie: String(response.headers["set-cookie"]).split(";")[0]!,
      csrf: String(response.headers["x-csrf-token"]),
    });
    const publicName = async (id: string) =>
      (
        await db.pool.query(
          "SELECT public_name FROM player_public_identity WHERE player_id=$1",
          [id],
        )
      ).rows[0].public_name;
    try {
      await migrate(db.pool);
      const visitor = await h.guest(),
        other = await h.guest();
      const forbidden = await request("POST", "/me/export", other, {});
      assert.equal(forbidden.statusCode, 403);
      assert.equal(
        (
          await request("POST", "/auth/register", visitor, {
            email,
            password,
            nickname: "Privacy Ronin",
          })
        ).statusCode,
        202,
      );
      let proof = "";
      await deliverAuthMail(
        db.pool,
        key,
        {
          async send(_id, mail) {
            proof = new URLSearchParams(new URL(mail.link).hash.slice(1)).get(
              "verify",
            )!;
          },
        },
        clock,
      );
      assert.ok(proof);
      const verified = await request("POST", "/auth/verify-email", visitor, {
        token: proof,
      });
      assert.equal(verified.statusCode, 204);
      let owner = rotate(visitor, verified);
      const promote = await request("PATCH", "/me", owner, {
        public_profile: true,
      });
      assert.equal(promote.statusCode, 200, promote.body);
      assert.equal(await publicName(owner.playerId), "Privacy Ronin");
      const hidden = await privacy.moderateNickname(owner.playerId, {
        hide: "OFFENSIVE",
      });
      assert.equal(hidden.nickname_moderation?.state, "HIDDEN");
      assert.equal(await publicName(owner.playerId), null);
      const changed = await request("PATCH", "/me", owner, {
        nickname: "Calm Wind",
      });
      assert.equal(changed.statusCode, 200, changed.body);
      assert.equal(await publicName(owner.playerId), null);
      assert.equal(
        (await request("GET", "/me/privacy", other)).json().nickname_moderation,
        null,
      );
      const appeal = await request("POST", "/me/nickname-appeal", owner, {});
      assert.equal(appeal.json().nickname_moderation.state, "APPEALED");
      assert.equal(
        (await request("POST", "/me/nickname-appeal", owner, {})).json()
          .nickname_moderation.appealed_at,
        appeal.json().nickname_moderation.appealed_at,
      );
      await privacy.moderateNickname(owner.playerId, { resolve: "RESTORED" });
      assert.equal(await publicName(owner.playerId), "Calm Wind");

      const run = await h.start(owner),
        segment = part(run);
      assert.equal((await h.upload(owner, segment)).statusCode, 201);
      const blockRequest = await request("POST", "/me/delete-request", owner, {
        confirmed: true,
      });
      assert.equal(blockRequest.json().error.code, "PRIVACY_RUNS_IN_PROGRESS");
      now += 1000;
      assert.equal((await h.finish(owner, segment)).statusCode, 202);
      assert.equal(
        await runOnce(new VerificationQueue(db.pool, clock)),
        "VERIFIED",
      );
      await db.pool.query(
        `INSERT INTO runs(id,player_id,rules_hash,mode,starting_region,seed,started_at,expires_at,status)
       SELECT gen_random_uuid(),r.player_id,r.rules_hash,r.mode,r.starting_region,r.seed,r.started_at,r.expires_at,'ABANDONED'
       FROM runs r CROSS JOIN generate_series(1,200) WHERE r.id=$1`,
        [run.run_id],
      );
      const otherRun = await h.start(other);
      now += 601_000;
      assert.equal(
        (await request("POST", "/me/export", owner, {})).json().error.code,
        "REAUTH_REQUIRED",
      );
      assert.equal(
        (await request("POST", "/auth/reauth", owner, { password })).statusCode,
        204,
      );
      const first = await request("POST", "/me/export", owner, {});
      assert.equal(first.statusCode, 200, first.body);
      assert.equal(first.headers["cache-control"], "no-store");
      const page = first.json();
      assert.equal(validate("PrivacyExportPage", page), true);
      assert.equal(page.profile.email, email);
      assert.equal(page.runs.length, 200);
      const second = await request("POST", "/me/export", owner, {
        cursor: page.next_cursor,
      });
      assert.equal(second.statusCode, 200, second.body);
      assert.equal(second.json().runs.length, 1);
      const ids = new Set(
        [...page.runs, ...second.json().runs].map(
          (r: { run_id: string }) => r.run_id,
        ),
      );
      assert.equal(ids.size, 201);
      assert.ok(ids.has(run.run_id));
      assert.ok(!ids.has(otherRun.run_id));
      for (const secret of [
        "verifier_digest",
        "csrf_digest",
        "ciphertext",
        "password",
        "state_hash",
      ])
        assert.ok(!first.body.includes(secret));

      const oldSession = owner;
      const pending = await request("POST", "/me/delete-request", owner, {
        confirmed: true,
      });
      assert.equal(pending.statusCode, 202, pending.body);
      owner = rotate(owner, pending);
      assert.equal(pending.json().deletion.state, "PENDING");
      assert.equal(
        Date.parse(pending.json().deletion.finalize_at),
        now + 7 * 86400000,
      );
      assert.equal((await request("GET", "/me", oldSession)).statusCode, 401);
      assert.equal(
        (await request("GET", "/me", owner)).json().account_status,
        "DELETION_PENDING",
      );
      assert.equal(
        (await request("PATCH", "/me", owner, { public_profile: false })).json()
          .error.code,
        "ACCOUNT_DELETION_PENDING",
      );
      assert.equal(await publicName(owner.playerId), null);
      const blocked = await h.api.inject({
        method: "POST",
        url: "/api/v1/runs/start",
        headers: {
          ...h.headers(owner),
          "idempotency-key": "privacy-fixture-run",
        },
        payload: { mode: "FULL" },
      });
      assert.equal(blocked.json().error.code, "ACCOUNT_DELETION_PENDING");
      assert.equal(await privacy.finalizeOne(key), false);
      const login = await request("POST", "/auth/login", await h.guest(), {
        email,
        password,
      });
      assert.equal(login.statusCode, 200, login.body);
      owner = rotate(owner, login);
      const cancelled = await request("DELETE", "/me/delete-request", owner);
      assert.equal(cancelled.statusCode, 200, cancelled.body);
      assert.equal(cancelled.json().deletion.state, "CANCELLED");
      assert.equal(await publicName(owner.playerId), "Calm Wind");
      const scheduled = await request("POST", "/me/delete-request", owner, {
        confirmed: true,
      });
      assert.equal(scheduled.statusCode, 202, scheduled.body);
      owner = rotate(owner, scheduled);

      // Null owner emulates encrypted, already delivered mail from before migration 009.
      await db.pool.query(
        "UPDATE auth_mail_outbox SET player_id=NULL WHERE player_id=$1",
        [owner.playerId],
      );
      now = Date.parse(scheduled.json().deletion.finalize_at);
      const finalLogin = await request("POST", "/auth/login", await h.guest(), {
        email,
        password,
      });
      assert.equal(finalLogin.statusCode, 200);
      owner = rotate(owner, finalLogin);
      assert.equal(
        (await request("DELETE", "/me/delete-request", owner)).json().error
          .code,
        "DELETION_CANNOT_CANCEL",
      );
      assert.deepEqual(
        (
          await Promise.all([
            privacy.finalizeOne(key),
            privacy.finalizeOne(key),
          ])
        ).sort(),
        [false, true],
      );
      assert.equal((await request("GET", "/me", owner)).statusCode, 401);
      assert.equal(await publicName(owner.playerId), null);
      const evidence = (
        await db.pool.query(
          "SELECT p.status,p.nickname,e.email,d.state AS deletion,(SELECT count(*) FROM run_outcomes WHERE player_id=p.id) AS results,(SELECT count(*) FROM auth_mail_outbox) AS queued FROM players p LEFT JOIN email_accounts e ON e.player_id=p.id JOIN deletion_requests d ON d.player_id=p.id WHERE p.id=$1",
          [owner.playerId],
        )
      ).rows[0];
      assert.deepEqual(evidence, {
        status: "ANONYMIZED",
        nickname: null,
        email: null,
        deletion: "COMPLETED",
        results: "1",
        queued: "0",
      });
      assert.equal(
        (await request("GET", "/runs/" + otherRun.run_id, other)).statusCode,
        200,
      );
    } finally {
      await h.api.close();
      await db.close();
    }
  },
);

test(
  "Google-only sessions can reauthenticate to cancel deletion",
  { timeout: 120000 },
  async () => {
    const db = await testPostgres();
    let now = Date.now();
    const clock = () => new Date(now),
      google = await syntheticGoogle(() => now);
    const h = harness(
      db.pool,
      clock,
      undefined,
      undefined,
      Buffer.alloc(32, 41),
      google.config,
    );
    const post = (
      path: string,
      client: Client,
      payload: Record<string, unknown>,
    ) =>
      h.api.inject({
        method: "POST",
        url: "/api/v1" + path,
        headers: h.headers(client),
        payload,
      });
    const rotate = (
      before: Client,
      response: Awaited<ReturnType<typeof post>>,
    ): Client => ({
      ...before,
      playerId: response.json().player_id ?? before.playerId,
      cookie: String(response.headers["set-cookie"]).split(";")[0]!,
      csrf: String(response.headers["x-csrf-token"]),
    });
    const googleProof = async (
      client: Client,
      purpose: "SIGN_IN" | "REAUTH",
    ) => {
      const challenge = await post("/auth/google/challenge", client, {
        purpose,
      });
      assert.equal(challenge.statusCode, 200, challenge.body);
      return {
        id_token: await google.sign(challenge.json().nonce, "privacy-google"),
      };
    };
    try {
      await migrate(db.pool);
      const guest = await h.guest(),
        signed = await post(
          "/auth/google",
          guest,
          await googleProof(guest, "SIGN_IN"),
        );
      assert.equal(signed.statusCode, 200);
      const owner = rotate(guest, signed),
        pending = await post("/me/delete-request", owner, { confirmed: true });
      assert.equal(pending.statusCode, 202);
      const anotherGuest = await h.guest();
      const login = await post(
        "/auth/google",
        anotherGuest,
        await googleProof(anotherGuest, "SIGN_IN"),
      );
      assert.equal(login.statusCode, 200, login.body);
      assert.equal(login.json().account_status, "DELETION_PENDING");
      const restricted = rotate(anotherGuest, login);
      assert.equal(restricted.playerId, owner.playerId);
      now += 601_000;
      const cancel = () =>
        h.api.inject({
          method: "DELETE",
          url: "/api/v1/me/delete-request",
          headers: h.headers(restricted),
        });
      assert.equal((await cancel()).json().error.code, "REAUTH_REQUIRED");
      const proved = await post(
        "/auth/google/reauth",
        restricted,
        await googleProof(restricted, "REAUTH"),
      );
      assert.equal(proved.statusCode, 204, proved.body);
      assert.equal((await cancel()).statusCode, 200);
    } finally {
      await h.api.close();
      await db.close();
    }
  },
);

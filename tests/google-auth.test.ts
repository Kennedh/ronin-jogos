import { test } from "node:test";
import assert from "node:assert/strict";
import { migrate, deliverAuthMail } from "@ronin/data";
import { createApi } from "../apps/api/src/index.ts";
import { syntheticGoogle } from "./helpers/google.ts";
import { testPostgres } from "./helpers/postgres.ts";
import { harness } from "./helpers/runtime.ts";
import type { Client } from "./helpers/runtime.ts";
import type { components } from "@ronin/contracts";

type Purpose = components["schemas"]["GoogleChallengeRequest"]["purpose"];

test(
  "Google Ronin ID: signed login, session nonce, isolated linking and revocation",
  { timeout: 120000 },
  async () => {
    const db = await testPostgres();
    const key = Buffer.alloc(32, 54);
    let now = Date.now();
    const clock = () => new Date(now);
    const google = await syntheticGoogle(() => now);
    const h = harness(db.pool, clock, undefined, undefined, key, google.config);
    const disabled = createApi({
      pool: db.pool,
      origin: "https://play.ronin.dev.br",
      rateSecret: Buffer.alloc(32, 26),
      authMailKey: key,
    });
    const post = (
      path: string,
      client: Client,
      payload: Record<string, unknown>,
    ) =>
      h.api.inject({
        method: "POST",
        url: "/api/v1" + path,
        headers: { ...h.headers(client), "x-ronin-auth": "1" },
        payload,
      });
    const get = (path: string, client: Client) =>
      h.api.inject({ url: "/api/v1" + path, headers: h.headers(client) });
    const challenge = async (client: Client, purpose: Purpose) => {
      const response = await post("/auth/google/challenge", client, {
        purpose,
      });
      assert.equal(response.statusCode, 200, response.body);
      return response.json().nonce as string;
    };
    const proof = async (client: Client, purpose: Purpose, subject: string) => {
      return {
        id_token: await google.sign(await challenge(client, purpose), subject),
      };
    };
    const rotated = (response: Awaited<ReturnType<typeof post>>): Client => ({
      playerId: response.json().player_id,
      cookie: String(response.headers["set-cookie"]).split(";")[0]!,
      csrf: String(response.headers["x-csrf-token"]),
    });
    const unlink = (client: Client) =>
      h.api.inject({
        method: "DELETE",
        url: "/api/v1/auth/google/link",
        headers: h.headers(client),
      });
    try {
      await migrate(db.pool);
      const guest = await h.guest(),
        other = await h.guest();
      assert.equal(
        (
          await h.api.inject({
            method: "PATCH",
            url: "/api/v1/me/character",
            headers: h.headers(guest),
            payload: {
              expected_appearance_version: 1,
              slots: { eye_style: "eyes_arched" },
            },
          })
        ).statusCode,
        200,
      );
      const run = await h.start(guest);
      assert.equal(
        (await get("/auth/google/config", guest)).json().client_id,
        google.config.clientId,
      );
      assert.deepEqual(
        (
          await disabled.inject({
            url: "/api/v1/auth/google/config",
            headers: h.headers(guest),
          })
        ).json(),
        { client_id: null },
      );
      assert.equal(
        (
          await disabled.inject({
            method: "POST",
            url: "/api/v1/auth/google/challenge",
            headers: h.headers(guest),
            payload: { purpose: "SIGN_IN" },
          })
        ).statusCode,
        503,
      );
      assert.equal(
        (
          await h.api.inject({
            method: "POST",
            url: "/api/v1/auth/google/challenge",
            headers: { ...h.headers(guest), "x-csrf-token": "" },
            payload: { purpose: "SIGN_IN" },
          })
        ).statusCode,
        403,
      );
      const nonce = await challenge(guest, "SIGN_IN");
      const reject = async (token: string) => {
        const response = await post("/auth/google", guest, { id_token: token });
        assert.equal(response.statusCode, 401, response.body);
      };
      await reject(
        await google.sign(nonce, "google-first", { aud: "other-client" }),
      );
      await reject(
        await google.sign(nonce, "google-first", {
          iss: "https://example.test",
        }),
      );
      await reject(
        await google.sign(nonce, "google-first", {
          exp: Math.floor(now / 1000) - 1,
        }),
      );
      await reject(
        await google.sign(nonce, "google-first", { azp: "other-client" }),
      );
      await reject(await google.sign(nonce, "google-first", {}, true));
      const valid = { id_token: await google.sign(nonce, "google-first") };
      assert.equal((await post("/auth/google", other, valid)).statusCode, 401);
      assert.equal(
        (await post("/auth/google/reauth", guest, valid)).statusCode,
        401,
      );
      const concurrent = await Promise.all([
        post("/auth/google", guest, valid),
        post("/auth/google", guest, valid),
      ]);
      assert.deepEqual(
        concurrent.map((response) => response.statusCode).sort(),
        [200, 401],
      );
      const signedResponse = concurrent.find(
        (response) => response.statusCode === 200,
      )!;
      const signed = rotated(signedResponse);
      assert.equal(signed.playerId, guest.playerId);
      assert.equal(
        (await get("/me/character", signed)).json().slots.eye_style,
        "eyes_arched",
      );
      assert.equal(signedResponse.json().account_type, "GOOGLE");
      assert.equal(signedResponse.json().email, null);
      assert.equal(signedResponse.json().email_verified, false);
      assert.equal((await get("/me", guest)).statusCode, 401);
      assert.equal((await get("/runs/" + run.run_id, signed)).statusCode, 200);
      assert.equal(
        (await unlink(signed)).json().error.code,
        "LAST_SIGN_IN_METHOD",
      );

      now += 301_000;
      const expired = await challenge(other, "SIGN_IN");
      now += 301_000;
      assert.equal(
        (
          await post("/auth/google", other, {
            id_token: await google.sign(expired, "google-first"),
          })
        ).statusCode,
        401,
      );
      const returning = await post(
        "/auth/google",
        other,
        await proof(other, "SIGN_IN", "google-first"),
      );
      assert.equal(returning.statusCode, 200, returning.body);
      assert.equal(returning.json().player_id, signed.playerId);
      const growing = await h.guest();
      await h.start(growing);
      assert.equal(
        (
          await post(
            "/auth/google",
            growing,
            await proof(growing, "SIGN_IN", "google-first"),
          )
        ).json().error.code,
        "GUEST_PROGRESS_REQUIRES_LINK",
      );
      assert.equal(
        (await get("/me", growing)).json().player_id,
        growing.playerId,
      );

      const googleSession = rotated(returning);
      const added = await post("/auth/register", googleSession, {
        email: "another-synthetic@example.test",
        password: "a second synthetic passphrase",
      });
      assert.equal(added.statusCode, 202, added.body);
      assert.equal(
        (await get("/me", googleSession)).json().account_type,
        "GOOGLE",
      );
      assert.equal(
        (await get("/me", googleSession)).json().email_verified,
        false,
      );
      let linkedEmailProof = "";
      await deliverAuthMail(
        db.pool,
        key,
        {
          async send(_id, mail) {
            linkedEmailProof = new URLSearchParams(
              new URL(mail.link).hash.slice(1),
            ).get("verify")!;
          },
        },
        clock,
      );
      assert.ok(linkedEmailProof);
      now += 601_000;
      const attach = () =>
        post("/auth/verify-email", googleSession, { token: linkedEmailProof });
      assert.equal((await attach()).json().error.code, "REAUTH_REQUIRED");
      const confirmGoogle = await proof(
        googleSession,
        "REAUTH",
        "google-first",
      );
      assert.equal(
        (await post("/auth/google/reauth", googleSession, confirmGoogle))
          .statusCode,
        204,
      );
      const addedEmail = await attach();
      assert.equal(addedEmail.statusCode, 204, addedEmail.body);
      const multiFirst = {
        ...googleSession,
        cookie: String(addedEmail.headers["set-cookie"]).split(";")[0]!,
        csrf: String(addedEmail.headers["x-csrf-token"]),
      };
      const firstProfile = (await get("/me", multiFirst)).json();
      assert.equal(firstProfile.player_id, guest.playerId);
      assert.equal(firstProfile.account_type, "MULTI");
      assert.equal(firstProfile.email, "another-synthetic@example.test");

      const localGuest = await h.guest(),
        password = "synthetic browser passphrase";
      const registration = await post("/auth/register", localGuest, {
        email: "synthetic@example.test",
        password,
        nickname: "Local Ronin",
      });
      assert.equal(registration.statusCode, 202);
      let verification = "";
      await deliverAuthMail(
        db.pool,
        key,
        {
          async send(_id, mail) {
            verification = new URLSearchParams(
              new URL(mail.link).hash.slice(1),
            ).get("verify")!;
          },
        },
        clock,
      );
      assert.ok(verification);
      const confirmation = await post("/auth/verify-email", localGuest, {
        token: verification,
      });
      assert.equal(confirmation.statusCode, 204);
      const local: Client = {
        ...localGuest,
        cookie: String(confirmation.headers["set-cookie"]).split(";")[0]!,
        csrf: String(confirmation.headers["x-csrf-token"]),
      };
      const denied = await post(
        "/auth/link",
        local,
        await proof(local, "LINK", "google-first"),
      );
      assert.equal(denied.json().error.code, "GOOGLE_IDENTITY_CONFLICT");
      assert.equal((await get("/me", local)).json().account_type, "EMAIL");

      const link = await post(
        "/auth/link",
        local,
        await proof(local, "LINK", "google-second"),
      );
      assert.equal(link.statusCode, 200, link.body);
      const multi = rotated(link);
      assert.equal(multi.playerId, local.playerId);
      assert.equal(link.json().account_type, "MULTI");
      assert.equal((await get("/me", local)).statusCode, 401);
      const newGuest = await h.guest();
      const loggedIn = await post(
        "/auth/google",
        newGuest,
        await proof(newGuest, "SIGN_IN", "google-second"),
      );
      assert.equal(loggedIn.statusCode, 200);
      const remoteSession = rotated(loggedIn);

      now += 601_000;
      assert.equal((await unlink(multi)).json().error.code, "REAUTH_REQUIRED");
      assert.equal(
        (
          await post(
            "/auth/google/reauth",
            multi,
            await proof(multi, "REAUTH", "google-first"),
          )
        ).statusCode,
        401,
      );
      const reauth = await proof(multi, "REAUTH", "google-second");
      assert.equal(
        (await post("/auth/google/reauth", multi, reauth)).statusCode,
        204,
      );
      assert.equal(
        (await post("/auth/google/reauth", multi, reauth)).statusCode,
        401,
      );
      const removal = await unlink(multi);
      assert.equal(removal.statusCode, 200, removal.body);
      assert.equal(removal.json().account_type, "EMAIL");
      assert.equal(removal.json().player_id, local.playerId);
      assert.equal((await get("/me", remoteSession)).statusCode, 401);
      assert.equal((await get("/me", multi)).statusCode, 401);
      assert.equal((await get("/me", rotated(removal))).statusCode, 200);
      const mailLogin = await post("/auth/login", await h.guest(), {
        email: "synthetic@example.test",
        password,
      });
      assert.equal(mailLogin.statusCode, 200);
      assert.equal(mailLogin.json().player_id, local.playerId);
      assert.equal(
        (await db.pool.query("SELECT count(*) AS n FROM auth_identities"))
          .rows[0].n,
        "1",
      );
    } finally {
      await Promise.all([h.api.close(), disabled.close()]);
      await db.close();
    }
  },
);

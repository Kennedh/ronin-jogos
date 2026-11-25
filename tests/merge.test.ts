import { test } from "node:test";
import assert from "node:assert/strict";
import { deliverAuthMail, migrate, VerificationQueue } from "@ronin/data";
import { runOnce } from "@ronin/verifier";
import { validate } from "@ronin/contracts";
import { harness, part } from "./helpers/runtime.ts";
import type { Client } from "./helpers/runtime.ts";
import { testPostgres } from "./helpers/postgres.ts";
import { syntheticGoogle } from "./helpers/google.ts";

test(
  "5B: dual proof, atomic progress transfer, retained replay evidence and deduplicated retry",
  { timeout: 120000 },
  async () => {
    const db = await testPostgres();
    await migrate(db.pool);
    let now = Date.now();
    const clock = () => new Date(now);
    const google = await syntheticGoogle(() => now);
    const key = Buffer.alloc(32, 82);
    const h = harness(db.pool, clock, undefined, undefined, key, google.config);
    const password = "synthetic merge destination passphrase";
    const email = "destination@example.test";
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
    const rotated = (
      before: Client,
      response: Awaited<ReturnType<typeof post>>,
    ): Client => ({
      playerId:
        response.statusCode === 204
          ? before.playerId
          : response.json().player_id,
      cookie: String(response.headers["set-cookie"]).split(";")[0]!,
      csrf: String(response.headers["x-csrf-token"]),
    });
    const preview = (c: Client) =>
      post("/auth/merge/preview", c, { method: "EMAIL", email, password });
    const confirm = (c: Client, nonce: string) =>
      post("/auth/merge/confirm", c, { merge_nonce: nonce, confirmed: true });
    const nonceFrom = async (c: Client) => {
      const result = await preview(c);
      assert.equal(result.statusCode, 200, result.body);
      assert.equal(validate("MergePreview", result.json()), true);
      return result.json().merge_nonce as string;
    };

    // Seed verified projections to exercise conflicting provenance across existing accounts.
    // The browser and verifier suites separately exercise the actual replay pipeline.
    async function closedRun(client: Client, score: string, bosses: number[]) {
      const ticket = await h.start(client);
      const run = ticket.run_id,
        hash = "b".repeat(64);
      await db.pool.query(
        `UPDATE runs SET status='VERIFIED', finish_received_at=started_at, upload_deadline=started_at,
       submitted_complete_at=started_at, final_segment_index=0, final_tick=20,
       final_hash=$2, end_reason='ABYSS' WHERE id=$1`,
        [run, hash],
      );
      await db.pool.query(
        `INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,state_hash)
      VALUES($1,$2,$3,20,20,'ABYSS',true,$4)`,
        [run, client.playerId, score, hash],
      );
      await db.pool.query(
        "INSERT INTO outbox_events(event_key,run_id,type,payload) VALUES($1,$2,'RUN_VERIFIED',$3)",
        [
          "run-verified:" + run,
          run,
          JSON.stringify({ player_id: client.playerId, run_id: run, score }),
        ],
      );
      const regions = ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"];
      const rewards = [
        "BROKEN_ROOTS",
        "SILENCED_BELL",
        "TAMED_WIND",
        "DISPELLED_ECLIPSE",
      ];
      for (const n of bosses) {
        const boss = "B0" + (n + 1),
          instance = "proof-" + boss;
        await db.pool.query(
          `INSERT INTO run_boss_outcomes(run_id,instance_id,boss_id,cycle_index,region_id,result,result_tick,hits,bonus)
        VALUES($1,$2,$3,1,$4,'DEFEATED',20,3,300)`,
          [run, instance, boss, regions[n]],
        );
        await db.pool.query(
          "INSERT INTO player_boss_seals VALUES($1,$2,$3,$4,$5)",
          [client.playerId, boss, run, instance, new Date(now)],
        );
        await db.pool.query("INSERT INTO player_rewards VALUES($1,$2,$3,$4)", [
          client.playerId,
          rewards[n],
          run,
          new Date(now),
        ]);
        await db.pool.query(
          "INSERT INTO player_regions VALUES($1,$2) ON CONFLICT DO NOTHING",
          [client.playerId, regions[n]],
        );
      }
      return run;
    }

    try {
      const visitor = await h.guest(),
        signup = await h.guest();
      assert.equal(
        (
          await post("/auth/register", signup, {
            email,
            password,
            nickname: "Destination Ronin",
          })
        ).statusCode,
        202,
      );
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
      const verified = await post("/auth/verify-email", signup, {
        token: verification,
      });
      assert.equal(verified.statusCode, 204);
      let destination = rotated(signup, verified);
      const linkChallenge = await post("/auth/google/challenge", destination, {
        purpose: "LINK",
      });
      assert.equal(linkChallenge.statusCode, 200);
      const googleLinked = await post("/auth/link", destination, {
        id_token: await google.sign(
          linkChallenge.json().nonce,
          "merge-google-target",
        ),
      });
      assert.equal(googleLinked.statusCode, 200);
      destination = rotated(destination, googleLinked);
      assert.equal(
        (
          await post("/auth/merge/preview", visitor, {
            method: "EMAIL",
            email,
            password: "incorrect",
          })
        ).statusCode,
        401,
      );
      const sourceRun = await closedRun(visitor, "9007199254740993", [0, 1, 3]);
      const targetRun = await closedRun(destination, "500", [0, 2]);
      const replay = await h.start(visitor);
      const segment = part(replay);
      assert.equal((await h.upload(visitor, segment)).statusCode, 201);
      now += 1_000;
      assert.equal((await h.finish(visitor, segment)).statusCode, 202);
      assert.equal(
        (await preview(visitor)).json().error.code,
        "MERGE_RUNS_IN_PROGRESS",
      );
      assert.equal(
        await runOnce(new VerificationQueue(db.pool, clock)),
        "VERIFIED",
      );
      async function replayEvidence() {
        const { rows } = await db.pool.query(
          "SELECT encode(s.payload,'hex') AS bytes,s.segment_hash,o.state_hash FROM run_segments s JOIN run_outcomes o USING(run_id) WHERE s.run_id=$1",
          [replay.run_id],
        );
        assert.ok(rows[0]?.bytes);
        return rows[0];
      }
      const beforeEvidence = await replayEvidence();
      const stale = await h.start(visitor);
      assert.equal(
        (await preview(visitor)).json().error.code,
        "MERGE_RUNS_IN_PROGRESS",
      );
      now = Date.parse(stale.expires_at) + 1;
      const oldPreview = await nonceFrom(visitor);
      const stranger = await h.guest();
      assert.equal((await confirm(stranger, oldPreview)).statusCode, 409);
      now += 300_001;
      assert.equal(
        (await confirm(visitor, oldPreview)).json().error.code,
        "MERGE_PROOF_INVALID",
      );

      const outdated = await nonceFrom(visitor);
      await h.api.inject({
        method: "PATCH",
        url: "/api/v1/me",
        headers: h.headers(visitor),
        payload: { nickname: "Original Guest" },
      });
      assert.equal(
        (await confirm(visitor, outdated)).json().error.code,
        "MERGE_PREVIEW_CHANGED",
      );
      const credentialPreview = await nonceFrom(visitor);
      const {
        rows: [oldPassword],
      } = await db.pool.query<{ digest: Buffer }>(
        "SELECT digest FROM password_credentials WHERE player_id=$1",
        [destination.playerId],
      );
      await db.pool.query(
        "UPDATE password_credentials SET digest=$2 WHERE player_id=$1",
        [destination.playerId, Buffer.alloc(32, 72)],
      );
      assert.equal(
        (await confirm(visitor, credentialPreview)).json().error.code,
        "MERGE_PROOF_INVALID",
      );
      await db.pool.query(
        "UPDATE password_credentials SET digest=$2 WHERE player_id=$1",
        [destination.playerId, oldPassword!.digest],
      );
      const current = await preview(visitor);
      assert.equal(current.statusCode, 200, current.body);
      const comparison = current.json();
      assert.equal(comparison.target_player_id, destination.playerId);
      assert.equal(
        comparison.summary.source.best_ranked_score,
        "9007199254740993",
      );
      assert.equal(comparison.summary.target.verified, 1);
      assert.equal((await get("/runs/" + sourceRun, visitor)).statusCode, 200);
      assert.equal(
        (await get("/runs/" + sourceRun, destination)).statusCode,
        404,
      );
      await assert.rejects(
        db.pool.query(
          "UPDATE runs SET player_id=$2,original_player_id=player_id WHERE id=$1",
          [sourceRun, destination.playerId],
        ),
        /immutable_run_ticket/,
      );

      // Prove that the exact same confirmation remains usable after a late transactional error.
      await db.pool.query(
        "ALTER TABLE account_audit ADD CONSTRAINT fixture_deny_transfer CHECK(event<>'GUEST_PROGRESS_MERGED')",
      );
      assert.equal(
        (await confirm(visitor, comparison.merge_nonce)).statusCode,
        500,
      );
      await db.pool.query(
        "ALTER TABLE account_audit DROP CONSTRAINT fixture_deny_transfer",
      );
      assert.equal((await get("/runs/" + sourceRun, visitor)).statusCode, 200);
      assert.equal(
        (await get("/runs/" + sourceRun, destination)).statusCode,
        404,
      );
      const attempts = await Promise.all([
        confirm(visitor, comparison.merge_nonce),
        confirm(visitor, comparison.merge_nonce),
      ]);
      assert.deepEqual(attempts.map((r) => r.statusCode).sort(), [200, 401]);
      const merged = rotated(
        visitor,
        attempts.find((r) => r.statusCode === 200)!,
      );
      assert.equal(merged.playerId, destination.playerId);
      assert.equal((await get("/me", visitor)).statusCode, 401);
      assert.equal(
        (await confirm(merged, comparison.merge_nonce)).statusCode,
        200,
      );
      assert.equal(
        (await get("/me", merged)).json().nickname,
        "Destination Ronin",
      );
      assert.equal(
        (await h.status(merged, sourceRun)).score,
        "9007199254740993",
      );
      assert.equal(
        (await get("/runs/" + stale.run_id, merged)).json().status,
        "EXPIRED",
      );
      assert.equal(
        (
          await db.pool.query(
            "SELECT original_player_id FROM runs WHERE id=$1",
            [sourceRun],
          )
        ).rows[0].original_player_id,
        visitor.playerId,
      );
      assert.equal(
        (
          await db.pool.query(
            "SELECT source_run FROM player_boss_seals WHERE player_id=$1 AND boss_id='B01'",
            [merged.playerId],
          )
        ).rows[0].source_run,
        targetRun,
      );
      assert.deepEqual(await replayEvidence(), beforeEvidence);
      assert.equal((await h.status(merged, replay.run_id)).status, "VERIFIED");
      const bossState = (await get("/me/bosses", merged)).json();
      assert.deepEqual(bossState.seals, ["B01", "B02", "B03", "B04"]);
      assert.ok(bossState.rewards.includes("AURORA_TRAIL"));
      assert.ok(bossState.rewards.includes("FOUR_PATHS_GUARDIAN"));
      assert.ok(!bossState.rewards.includes("PATH_LEGEND"));
      assert.equal(
        (
          await db.pool.query(
            "SELECT count(*) AS n FROM outbox_events WHERE type='PLAYER_MERGED'",
          )
        ).rows[0].n,
        "1",
      );
      assert.equal(
        (
          await db.pool.query(
            "SELECT payload FROM outbox_events WHERE run_id=$1",
            [sourceRun],
          )
        ).rows[0].payload.player_id,
        visitor.playerId,
      );

      const googleSource = await h.guest();
      const googleChallenge = await post(
        "/auth/google/challenge",
        googleSource,
        { purpose: "MERGE" },
      );
      assert.equal(googleChallenge.statusCode, 200);
      const googleCredential = {
        id_token: await google.sign(
          googleChallenge.json().nonce,
          "merge-google-target",
        ),
      };
      assert.equal(
        (await post("/auth/google", googleSource, googleCredential)).statusCode,
        401,
      );
      const googlePreview = await post("/auth/merge/preview", googleSource, {
        method: "GOOGLE",
        ...googleCredential,
      });
      assert.equal(googlePreview.statusCode, 200, googlePreview.body);
      assert.equal(googlePreview.json().target_player_id, destination.playerId);
      assert.equal(
        (
          await post("/auth/merge/preview", googleSource, {
            method: "GOOGLE",
            ...googleCredential,
          })
        ).statusCode,
        401,
      );
      const targetUpdate = await h.api.inject({
        method: "PATCH",
        url: "/api/v1/me",
        headers: h.headers(merged),
        payload: { public_profile: true },
      });
      assert.equal(targetUpdate.statusCode, 200);
      const googleMerged = await confirm(
        googleSource,
        googlePreview.json().merge_nonce,
      );
      assert.equal(googleMerged.statusCode, 200, googleMerged.body);
      assert.equal(googleMerged.json().player_id, merged.playerId);
      assert.equal(googleMerged.json().public_profile, true);
    } finally {
      await h.api.close();
      await db.close();
    }
  },
);

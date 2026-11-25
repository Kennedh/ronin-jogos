import { test } from "node:test";
import assert from "node:assert/strict";
import { migrate, migrationFiles, checksum } from "@ronin/data";
import { testPostgres } from "./helpers/postgres.ts";
import { randomUUID } from "node:crypto";
test(
  "RR-DATA-001: real Postgres migrations, upgrade, constraints, drift and rollback",
  { timeout: 120000 },
  async () => {
    assert.equal(checksum("SELECT 1;\r\n"), checksum("SELECT 1;\n"));
    const db = await testPostgres();
    try {
      if (process.platform === "win32") {
        await assert.rejects(
          () => db.cluster.start(),
          /dev_postgres_already_running/,
        );
        // Refusing a second start must preserve the active server.
        assert.equal(
          (await db.pool.query("SELECT 1 AS alive")).rows[0].alive,
          1,
        );
      }
      const version = await db.pool.query("SHOW server_version");
      console.log("QA PostgreSQL", version.rows[0]["server_version"]);
      assert.equal(
        (await db.pool.query("SHOW listen_addresses")).rows[0].listen_addresses,
        "127.0.0.1",
      );
      const files = await migrationFiles();
      assert.equal(files.length, 10);
      assert.deepEqual(await migrate(db.pool, files.slice(0, 1)), ["001_runs"]);
      const player = randomUUID(),
        other = randomUUID(),
        run = randomUUID(),
        hash = "a".repeat(64);
      await db.pool.query("INSERT INTO players(id) VALUES($1),($2)", [
        player,
        other,
      ]);
      const invalid = [
        ...files,
        {
          id: "011_bad",
          sql: "CREATE TABLE must_rollback(id int); SELECT invalid_column;",
        },
      ];
      await assert.rejects(() => migrate(db.pool, invalid));
      assert.equal(
        (await db.pool.query("SELECT to_regclass('run_outcomes') as t")).rows[0]
          .t,
        null,
      );
      assert.equal(
        (await db.pool.query("SELECT to_regclass('must_rollback') as t"))
          .rows[0].t,
        null,
      );
      assert.equal(
        (await db.pool.query("SELECT count(*) FROM players")).rows[0].count,
        "2",
      );
      const results = await Promise.all([migrate(db.pool), migrate(db.pool)]);
      assert.deepEqual(results.flat(), [
        "002_verification",
        "003_runtime",
        "004_bosses",
        "005_email_accounts",
        "006_player_profiles",
        "007_google_identity",
        "008_account_merges",
        "009_privacy_workflows",
        "010_character_profiles",
      ]);
      assert.deepEqual(await migrate(db.pool), []);
      await assert.rejects(
        () =>
          migrate(db.pool, [
            { ...files[0]!, sql: files[0]!.sql + "--changed" },
            files[1]!,
          ]),
        /migration_drift/,
      );
      await db.pool.query(
        "INSERT INTO rules_versions(manifest_hash,manifest) VALUES($1,$2)",
        [hash, { version: 1 }],
      );
      await db.pool.query(
        "INSERT INTO runs(id,player_id,rules_hash,mode,starting_region,seed,expires_at) VALUES($1,$2,$3,'FULL','BAMBOO',$4,now()+interval '72h')",
        [run, player, hash, "a".repeat(32)],
      );
      await assert.rejects(
        () =>
          db.pool.query(
            "INSERT INTO runs(id,player_id,rules_hash,mode,starting_region,seed,expires_at) VALUES($1,$2,$3,'FULL','TEMPLE',$4,now()+interval '72h')",
            [randomUUID(), player, hash, "a".repeat(32)],
          ),
        { code: "23514" },
      );
      const insertSegment = (h: string) =>
        db.pool.query(
          "INSERT INTO run_segments(run_id,segment_index,start_tick,end_tick,segment_hash,payload,decoded_size,encoding) VALUES($1,0,0,60,$2,$3,2,'identity')",
          [run, h, Buffer.from("{}")],
        );
      await insertSegment(hash);
      await assert.rejects(() => insertSegment("b".repeat(64)), {
        code: "23505",
      });
      await assert.rejects(
        () =>
          db.pool.query(
            "INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,state_hash) VALUES($1,$2,100,100,60,'HP_ZERO',true,$3)",
            [run, player, hash],
          ),
        { code: "23503" },
      );
      await db.pool.query(
        "UPDATE runs SET status='VERIFIED',finish_received_at=now(),upload_deadline=now()+interval '24h',submitted_complete_at=now(),final_segment_index=0,final_tick=60,final_hash=$2,end_reason='HP_ZERO' WHERE id=$1",
        [run, hash],
      );
      await assert.rejects(
        () =>
          db.pool.query(
            "INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,state_hash) VALUES($1,$2,100,100,60,'HP_ZERO',true,$3)",
            [run, other, hash],
          ),
        { code: "23503" },
      );
      await assert.rejects(
        () =>
          db.pool.query(
            "INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,state_hash) VALUES($1,$2,1.5,100,60,'HP_ZERO',true,$3)",
            [run, player, hash],
          ),
        { code: "23514" },
      );
      await assert.rejects(
        () =>
          db.pool.query(
            "INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,state_hash) VALUES($1,$2,100,100,60,'QUIT',true,$3)",
            [run, player, hash],
          ),
        { code: "23514" },
      );
      await assert.rejects(
        () =>
          db.pool.query(
            "INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,state_hash) VALUES($1,$2,'NaN',100,60,'HP_ZERO',true,$3)",
            [run, player, hash],
          ),
        { code: "23514" },
      );
      const score = "9007199254740993123456789";
      await db.pool.query(
        "INSERT INTO run_outcomes(run_id,player_id,score,real_distance,active_ticks,end_reason,ranked,state_hash) VALUES($1,$2,$3,100,60,'HP_ZERO',true,$4)",
        [run, player, score, hash],
      );
      assert.equal(
        (
          await db.pool.query(
            "SELECT score FROM run_outcomes WHERE run_id=$1",
            [run],
          )
        ).rows[0].score,
        score,
      );
      await assert.rejects(
        () =>
          db.pool.query(
            "INSERT INTO leaderboard_boards(id,mode,starting_region,rules_major,period_id) VALUES('a','FULL','BAMBOO',1,'all'),('b','FULL','BAMBOO',1,'all')",
          ),
        { code: "23505" },
      );
    } finally {
      await db.close();
    }
  },
);

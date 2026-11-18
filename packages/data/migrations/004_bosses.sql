-- Boss events are produced only by the verifier and committed with the outcome.
CREATE TABLE run_boss_outcomes (
 run_id uuid NOT NULL REFERENCES run_outcomes(run_id), instance_id text NOT NULL,
 boss_id text NOT NULL CHECK(boss_id IN ('B01','B02','B03','B04')),
 cycle_index bigint NOT NULL CHECK(cycle_index>0 AND cycle_index<=9007199254740991),
 region_id text NOT NULL CHECK(region_id IN ('BAMBOO','TEMPLE','MOUNTAINS','CASTLE')),
 result text NOT NULL CHECK(result IN ('DEFEATED','RETREATED')),
 result_tick bigint NOT NULL CHECK(result_tick>=0 AND result_tick<=9007199254740991),
 hits integer NOT NULL CHECK(hits BETWEEN 0 AND 6), bonus integer NOT NULL CHECK(bonus IN (0,300,450,600,900)),
 CHECK((result='RETREATED' AND bonus=0) OR (result='DEFEATED' AND bonus>0)),
 CHECK((boss_id='B01' AND region_id='BAMBOO') OR (boss_id='B02' AND region_id='TEMPLE') OR (boss_id='B03' AND region_id='MOUNTAINS') OR (boss_id='B04' AND region_id='CASTLE')),
 PRIMARY KEY(run_id,instance_id)
);
CREATE TABLE player_boss_seals (
 player_id uuid NOT NULL REFERENCES players(id), boss_id text NOT NULL CHECK(boss_id IN ('B01','B02','B03','B04')),
 source_run uuid NOT NULL, source_instance text NOT NULL, earned_at timestamptz NOT NULL,
 PRIMARY KEY(player_id,boss_id), FOREIGN KEY(source_run,source_instance) REFERENCES run_boss_outcomes(run_id,instance_id),
 FOREIGN KEY(source_run,player_id) REFERENCES run_outcomes(run_id,player_id)
);
CREATE TABLE player_rewards (
 player_id uuid NOT NULL REFERENCES players(id), reward_id text NOT NULL CHECK(reward_id IN ('AURORA_TRAIL','FOUR_PATHS_GUARDIAN','PATH_LEGEND','BROKEN_ROOTS','SILENCED_BELL','TAMED_WIND','DISPELLED_ECLIPSE')),
 source_run uuid NOT NULL, earned_at timestamptz NOT NULL,
 PRIMARY KEY(player_id,reward_id), FOREIGN KEY(source_run,player_id) REFERENCES run_outcomes(run_id,player_id)
);

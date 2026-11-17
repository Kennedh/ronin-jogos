CREATE TABLE run_verification_jobs (
 run_id uuid PRIMARY KEY REFERENCES runs(id),
 state text NOT NULL DEFAULT 'PENDING' CHECK(state IN ('PENDING','RUNNING','DONE','FAILED')),
 generation bigint NOT NULL DEFAULT 0 CHECK(generation>=0),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 available_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz,
 last_error_code text,
 CHECK((state='RUNNING' AND lease_until IS NOT NULL AND generation>0) OR (state<>'RUNNING' AND lease_until IS NULL))
);
CREATE INDEX verification_pending ON run_verification_jobs(available_at,run_id) WHERE state='PENDING';
CREATE TABLE run_outcomes (
 run_id uuid PRIMARY KEY,player_id uuid NOT NULL,
 run_status text NOT NULL DEFAULT 'VERIFIED' CHECK(run_status='VERIFIED'),
 score numeric NOT NULL CHECK(score>=0 AND scale(score)=0 AND score::text ~ '^(0|[1-9][0-9]*)$'),
 real_distance bigint NOT NULL CHECK(real_distance>=0),active_ticks bigint NOT NULL CHECK(active_ticks>=0),
 end_reason text NOT NULL CHECK(end_reason IN ('HP_ZERO','ABYSS','QUIT')),
 ranked boolean NOT NULL, verified_at timestamptz NOT NULL DEFAULT now(),
 state_hash text NOT NULL CHECK(state_hash ~ '^[a-f0-9]{64}$'),
 FOREIGN KEY(run_id,player_id) REFERENCES runs(id,player_id),
 FOREIGN KEY(run_id,run_status) REFERENCES runs(id,status),
 FOREIGN KEY(run_id,end_reason) REFERENCES runs(id,end_reason),
 CHECK(end_reason<>'QUIT' OR ranked=false),UNIQUE(run_id,player_id)
);
CREATE TABLE outbox_events (
 event_key text PRIMARY KEY,run_id uuid REFERENCES run_outcomes(run_id),
 type text NOT NULL,payload jsonb NOT NULL CHECK(jsonb_typeof(payload)='object'),
 created_at timestamptz NOT NULL DEFAULT now(),delivered_at timestamptz
);
-- Stable, non-null board identity; projection best_scores is implemented in phase7.
CREATE TABLE leaderboard_boards (
 id text PRIMARY KEY,mode text NOT NULL CHECK(mode IN ('FULL','REGIONAL')),
 starting_region text NOT NULL CHECK(starting_region IN ('BAMBOO','TEMPLE','MOUNTAINS','CASTLE')),
 rules_major integer NOT NULL CHECK(rules_major>0),period_id text NOT NULL,
 CHECK(mode<>'FULL' OR starting_region='BAMBOO'),
 UNIQUE(mode,starting_region,rules_major,period_id)
);

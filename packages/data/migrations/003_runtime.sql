ALTER TABLE players ADD COLUMN locale text NOT NULL DEFAULT 'en' CHECK(locale IN ('pt-BR','en'));
ALTER TABLE players ADD COLUMN nickname text;
ALTER TABLE sessions ADD COLUMN csrf_digest bytea CHECK(csrf_digest IS NULL OR octet_length(csrf_digest)=32);
CREATE TABLE player_regions (
 player_id uuid NOT NULL REFERENCES players(id), region_id text NOT NULL CHECK(region_id IN ('BAMBOO','TEMPLE','MOUNTAINS','CASTLE')),
 PRIMARY KEY(player_id,region_id)
);
INSERT INTO player_regions(player_id,region_id) SELECT id,'BAMBOO' FROM players;
ALTER TABLE runs ADD COLUMN rejection_code text;
ALTER TABLE runs ADD COLUMN resource_policy jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(resource_policy)='object');
CREATE TABLE run_start_keys (
 player_id uuid NOT NULL REFERENCES players(id),key_digest bytea NOT NULL CHECK(octet_length(key_digest)=32),
 request_hash text NOT NULL,run_id uuid NOT NULL UNIQUE REFERENCES runs(id),PRIMARY KEY(player_id,key_digest)
);
CREATE TABLE api_rate_buckets (
 scope text NOT NULL,key_digest bytea NOT NULL CHECK(octet_length(key_digest)=32),
 window_start timestamptz NOT NULL,hits integer NOT NULL CHECK(hits>0),PRIMARY KEY(scope,key_digest)
);
CREATE INDEX api_rate_expiry ON api_rate_buckets(window_start);
CREATE INDEX runs_open ON runs(player_id,expires_at) WHERE status IN ('ACTIVE','AWAITING_SEGMENTS','PENDING','VERIFYING');
CREATE INDEX verification_expired ON run_verification_jobs(lease_until,run_id) WHERE state='RUNNING';
-- Historic manifests are append-only. New rules require a new digest/record.
CREATE FUNCTION immutable_rules_manifest() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'immutable_rules_manifest'; END $$;
CREATE TRIGGER immutable_rules BEFORE UPDATE OR DELETE ON rules_versions FOR EACH ROW EXECUTE FUNCTION immutable_rules_manifest();

ALTER TABLE run_outcomes ADD COLUMN rules_hash text REFERENCES rules_versions(manifest_hash);
ALTER TABLE run_outcomes ADD COLUMN week_starts_at timestamptz;
ALTER TABLE run_outcomes ADD COLUMN weekly_eligible boolean NOT NULL DEFAULT false;
ALTER TABLE run_outcomes ADD CHECK(NOT weekly_eligible OR (ranked AND week_starts_at IS NOT NULL));
CREATE FUNCTION immutable_run_ticket() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.id,NEW.player_id,NEW.rules_hash,NEW.mode,NEW.starting_region,NEW.seed,NEW.started_at,NEW.expires_at,NEW.resource_policy)
    IS DISTINCT FROM ROW(OLD.id,OLD.player_id,OLD.rules_hash,OLD.mode,OLD.starting_region,OLD.seed,OLD.started_at,OLD.expires_at,OLD.resource_policy)
 THEN RAISE EXCEPTION 'immutable_run_ticket'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER immutable_ticket BEFORE UPDATE ON runs FOR EACH ROW EXECUTE FUNCTION immutable_run_ticket();
CREATE FUNCTION immutable_segment() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'immutable_segment'; END $$;
CREATE TRIGGER immutable_replay BEFORE UPDATE ON run_segments FOR EACH ROW EXECUTE FUNCTION immutable_segment();

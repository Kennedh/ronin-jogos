ALTER TABLE players DROP CONSTRAINT players_status_check,
 ADD COLUMN merged_into uuid REFERENCES players(id),
 ADD CONSTRAINT players_status_check CHECK(status IN ('GUEST','EMAIL_PENDING','REGISTERED','DELETION_PENDING','ANONYMIZED','MERGED')),
 ADD CONSTRAINT merged_player_target CHECK((status='MERGED')=(merged_into IS NOT NULL) AND merged_into IS DISTINCT FROM id);

ALTER TABLE google_challenges DROP CONSTRAINT google_challenges_purpose_check,
 ADD CONSTRAINT google_challenges_purpose_check CHECK(purpose IN ('SIGN_IN','LINK','REAUTH','MERGE'));

CREATE TABLE account_merge_transactions (
 id uuid PRIMARY KEY,
 source_player_id uuid NOT NULL REFERENCES players(id),
 source_session_id uuid NOT NULL REFERENCES sessions(id),
 target_player_id uuid NOT NULL REFERENCES players(id),
 nonce_digest bytea NOT NULL UNIQUE CHECK(octet_length(nonce_digest)=32),
 proof_method text NOT NULL CHECK(proof_method IN ('EMAIL','GOOGLE')),
 proof_digest bytea CHECK(octet_length(proof_digest)=32),
 preview_digest bytea CHECK(octet_length(preview_digest)=32),
 created_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK(expires_at>created_at),
 state text NOT NULL CHECK(state IN ('PREVIEW','APPLYING','COMPLETED')),
 completed_at timestamptz,
 CHECK(source_player_id<>target_player_id),
 CHECK((state='COMPLETED')=(completed_at IS NOT NULL)),
 CHECK((state='COMPLETED')=(proof_digest IS NULL)),
 CHECK((state='COMPLETED')=(preview_digest IS NULL))
);
CREATE UNIQUE INDEX merge_source_applied ON account_merge_transactions(source_player_id) WHERE state IN ('APPLYING','COMPLETED');
CREATE INDEX merge_pending_expiry ON account_merge_transactions(expires_at) WHERE state='PREVIEW';
CREATE INDEX merge_preview_session ON account_merge_transactions(source_session_id) WHERE state='PREVIEW';

-- Keep original attribution without changing existing tickets. Only an applying merge may transfer a closed run.
ALTER TABLE runs ADD COLUMN original_player_id uuid REFERENCES players(id),
 ADD CONSTRAINT original_run_owner CHECK(original_player_id IS DISTINCT FROM player_id);
ALTER TABLE run_outcomes DROP CONSTRAINT run_outcomes_run_id_player_id_fkey,
 ADD CONSTRAINT run_outcomes_run_id_player_id_fkey FOREIGN KEY(run_id,player_id) REFERENCES runs(id,player_id) ON UPDATE CASCADE;
ALTER TABLE player_boss_seals DROP CONSTRAINT player_boss_seals_source_run_player_id_fkey,
 ADD CONSTRAINT player_boss_seals_source_run_player_id_fkey FOREIGN KEY(source_run,player_id) REFERENCES run_outcomes(run_id,player_id) ON UPDATE CASCADE;
ALTER TABLE player_rewards DROP CONSTRAINT player_rewards_source_run_player_id_fkey,
 ADD CONSTRAINT player_rewards_source_run_player_id_fkey FOREIGN KEY(source_run,player_id) REFERENCES run_outcomes(run_id,player_id) ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION immutable_run_ticket() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.id,NEW.rules_hash,NEW.mode,NEW.starting_region,NEW.seed,NEW.started_at,NEW.expires_at,NEW.resource_policy)
    IS DISTINCT FROM ROW(OLD.id,OLD.rules_hash,OLD.mode,OLD.starting_region,OLD.seed,OLD.started_at,OLD.expires_at,OLD.resource_policy)
 THEN RAISE EXCEPTION 'immutable_run_ticket'; END IF;
 IF NEW.player_id IS DISTINCT FROM OLD.player_id THEN
   IF OLD.original_player_id IS NOT NULL OR NEW.original_player_id IS DISTINCT FROM OLD.player_id
      OR OLD.status NOT IN ('VERIFIED','REJECTED','ABANDONED','EXPIRED')
      OR NOT EXISTS (SELECT 1 FROM account_merge_transactions
        WHERE state='APPLYING' AND source_player_id=OLD.player_id AND target_player_id=NEW.player_id)
   THEN RAISE EXCEPTION 'immutable_run_ticket'; END IF;
 ELSIF NEW.original_player_id IS DISTINCT FROM OLD.original_player_id
 THEN RAISE EXCEPTION 'immutable_run_ticket'; END IF;
 RETURN NEW;
END $$;

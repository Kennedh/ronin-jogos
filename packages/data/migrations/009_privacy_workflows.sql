CREATE TABLE deletion_requests (
 player_id uuid PRIMARY KEY REFERENCES players(id),
 requested_at timestamptz NOT NULL,
 finalize_at timestamptz NOT NULL CHECK(finalize_at>requested_at),
 state text NOT NULL CHECK(state IN ('PENDING','CANCELLED','COMPLETED')),
 resolved_at timestamptz,
 CHECK((state='PENDING')=(resolved_at IS NULL))
);
CREATE INDEX due_deletion_requests ON deletion_requests(finalize_at,player_id) WHERE state='PENDING';

CREATE TABLE nickname_moderation (
 player_id uuid PRIMARY KEY REFERENCES players(id),
 reason text NOT NULL CHECK(reason IN ('IMPERSONATION','OFFENSIVE','PERSONAL_DATA','OTHER')),
 hidden_at timestamptz NOT NULL,
 appealed_at timestamptz,
 resolved_at timestamptz,
 state text NOT NULL CHECK(state IN ('HIDDEN','APPEALED','RESTORED','UPHELD')),
 CHECK((state='APPEALED')=(appealed_at IS NOT NULL AND resolved_at IS NULL)),
 CHECK((state IN ('RESTORED','UPHELD'))=(resolved_at IS NOT NULL))
);

CREATE VIEW player_public_identity AS
SELECT p.id AS player_id,
       CASE WHEN p.public_profile AND p.status IN ('GUEST','EMAIL_PENDING','REGISTERED')
                 AND (m.state IS NULL OR m.state='RESTORED') THEN p.nickname END AS public_name,
       p.public_profile AND p.status IN ('GUEST','EMAIL_PENDING','REGISTERED') AS public_profile
FROM players p LEFT JOIN nickname_moderation m ON m.player_id=p.id;

ALTER TABLE account_merge_transactions
 ALTER COLUMN source_session_id DROP NOT NULL,
 DROP CONSTRAINT account_merge_transactions_source_session_id_fkey,
 ADD CONSTRAINT account_merge_transactions_source_session_id_fkey FOREIGN KEY(source_session_id) REFERENCES sessions(id) ON DELETE SET NULL,
 ADD CONSTRAINT pending_merge_source_session CHECK(state='COMPLETED' OR source_session_id IS NOT NULL);

ALTER TABLE auth_mail_outbox ADD COLUMN player_id uuid REFERENCES players(id);
CREATE INDEX auth_mail_owner ON auth_mail_outbox(player_id);
CREATE INDEX outcomes_player ON run_outcomes(player_id);

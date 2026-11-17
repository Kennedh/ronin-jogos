CREATE TABLE players (
 id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL DEFAULT 'GUEST' CHECK(status IN ('GUEST','EMAIL_PENDING','REGISTERED','DELETION_PENDING','ANONYMIZED'))
);
CREATE TABLE sessions (
 id uuid PRIMARY KEY, player_id uuid NOT NULL REFERENCES players(id),
 verifier_digest bytea NOT NULL CHECK(octet_length(verifier_digest)=32),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 revoked_at timestamptz, CHECK(expires_at>created_at)
);
CREATE INDEX sessions_owner ON sessions(player_id);
CREATE TABLE rules_versions (
 manifest_hash text PRIMARY KEY CHECK(manifest_hash ~ '^[a-f0-9]{64}$'),
 manifest jsonb NOT NULL CHECK(jsonb_typeof(manifest)='object'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE runs (
 id uuid PRIMARY KEY, player_id uuid NOT NULL REFERENCES players(id),
 rules_hash text NOT NULL REFERENCES rules_versions(manifest_hash),
 mode text NOT NULL CHECK(mode IN ('FULL','REGIONAL')),
 starting_region text NOT NULL CHECK(starting_region IN ('BAMBOO','TEMPLE','MOUNTAINS','CASTLE')),
 seed text NOT NULL CHECK(seed ~ '^[a-f0-9]{32}$'),
 started_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('CREATED','ACTIVE','AWAITING_SEGMENTS','PENDING','VERIFYING','VERIFIED','REJECTED','ABANDONED','EXPIRED')),
 finish_received_at timestamptz,upload_deadline timestamptz,submitted_complete_at timestamptz,
 final_segment_index bigint CHECK(final_segment_index>=0 AND final_segment_index<=9007199254740991),
 final_tick bigint CHECK(final_tick>=0 AND final_tick<=9007199254740991),
 final_hash text CHECK(final_hash ~ '^[a-f0-9]{64}$'),
 end_reason text CHECK(end_reason IN ('HP_ZERO','ABYSS','QUIT')),
 CHECK(expires_at>started_at),CHECK(mode<>'FULL' OR starting_region='BAMBOO'),
 CHECK((finish_received_at IS NULL AND upload_deadline IS NULL AND final_tick IS NULL AND final_segment_index IS NULL AND final_hash IS NULL AND end_reason IS NULL) OR
       (finish_received_at IS NOT NULL AND finish_received_at<=expires_at AND upload_deadline IS NOT NULL AND upload_deadline>=finish_received_at AND final_tick IS NOT NULL AND final_segment_index IS NOT NULL AND final_hash IS NOT NULL AND end_reason IS NOT NULL)),
 CHECK(status NOT IN ('AWAITING_SEGMENTS','PENDING','VERIFYING','VERIFIED') OR finish_received_at IS NOT NULL),
 CHECK(status NOT IN ('PENDING','VERIFYING','VERIFIED') OR submitted_complete_at IS NOT NULL),
 CHECK(submitted_complete_at IS NULL OR (finish_received_at IS NOT NULL AND submitted_complete_at>=finish_received_at AND submitted_complete_at<=upload_deadline)),
 UNIQUE(id,player_id),UNIQUE(id,status),UNIQUE(id,end_reason)
);
CREATE INDEX runs_owner ON runs(player_id,started_at DESC);
CREATE TABLE run_segments (
 run_id uuid NOT NULL REFERENCES runs(id),segment_index bigint NOT NULL CHECK(segment_index>=0 AND segment_index<=9007199254740991),
 start_tick bigint NOT NULL CHECK(start_tick>=0 AND start_tick<=9007199254740991),
 end_tick bigint NOT NULL CHECK(end_tick>=start_tick AND end_tick-start_tick<=3600 AND end_tick<=9007199254740991),
 segment_hash text NOT NULL CHECK(segment_hash ~ '^[a-f0-9]{64}$'),
 previous_hash text CHECK(previous_hash ~ '^[a-f0-9]{64}$'),
 payload bytea NOT NULL CHECK(octet_length(payload)<=262144),
 decoded_size integer NOT NULL CHECK(decoded_size BETWEEN 0 AND 1048576),
 encoding text NOT NULL CHECK(encoding IN ('identity','gzip')),
 received_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(run_id,segment_index),
 CHECK((segment_index=0 AND start_tick=0 AND previous_hash IS NULL) OR (segment_index>0 AND previous_hash IS NOT NULL))
);

ALTER TABLE sessions ADD COLUMN authenticated_at timestamptz;
ALTER TABLE sessions ADD COLUMN last_seen_at timestamptz;
UPDATE sessions SET last_seen_at=created_at;
ALTER TABLE sessions ALTER COLUMN last_seen_at SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN last_seen_at SET DEFAULT now();
CREATE TABLE email_accounts (
 player_id uuid PRIMARY KEY REFERENCES players(id), email text NOT NULL UNIQUE CHECK(email=lower(email) AND length(email)<=254),
 verified_at timestamptz NOT NULL
);
CREATE TABLE password_credentials (
 player_id uuid PRIMARY KEY REFERENCES email_accounts(player_id), algorithm text NOT NULL CHECK(algorithm='argon2id-19m-t2-p1-v1'),
 salt bytea NOT NULL CHECK(octet_length(salt)=16), digest bytea NOT NULL CHECK(octet_length(digest)=32), changed_at timestamptz NOT NULL
);
CREATE TABLE email_registrations (
 player_id uuid PRIMARY KEY REFERENCES players(id), request_id uuid NOT NULL UNIQUE,
 email text NOT NULL CHECK(email=lower(email) AND length(email)<=254), algorithm text NOT NULL CHECK(algorithm='argon2id-19m-t2-p1-v1'),
 salt bytea NOT NULL CHECK(octet_length(salt)=16), digest bytea NOT NULL CHECK(octet_length(digest)=32),
 requested_at timestamptz NOT NULL, expires_at timestamptz NOT NULL CHECK(expires_at>requested_at)
);
CREATE TABLE nickname_reservations (
 normalized_name text PRIMARY KEY, player_id uuid NOT NULL UNIQUE REFERENCES players(id)
);
CREATE TABLE account_tokens (
 digest bytea PRIMARY KEY CHECK(octet_length(digest)=32), player_id uuid NOT NULL REFERENCES players(id),
 purpose text NOT NULL CHECK(purpose IN ('VERIFY','RESET')), request_id uuid,
 created_at timestamptz NOT NULL, expires_at timestamptz NOT NULL CHECK(expires_at>created_at), used_at timestamptz
);
CREATE INDEX account_token_owner ON account_tokens(player_id,purpose);
CREATE TABLE auth_email_cooldowns (
 email_digest bytea PRIMARY KEY CHECK(octet_length(email_digest)=32), sent_at timestamptz NOT NULL
);
CREATE TABLE auth_mail_outbox (
 id uuid PRIMARY KEY, ciphertext bytea NOT NULL, nonce bytea NOT NULL CHECK(octet_length(nonce)=12), tag bytea NOT NULL CHECK(octet_length(tag)=16),
 state text NOT NULL DEFAULT 'PENDING' CHECK(state IN ('PENDING','SENDING','SENT','FAILED')),
 generation bigint NOT NULL DEFAULT 0, attempts integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL, available_at timestamptz NOT NULL, lease_until timestamptz, delivered_at timestamptz,
 CHECK((state='SENDING')=(lease_until IS NOT NULL))
);
CREATE INDEX auth_mail_pending ON auth_mail_outbox(available_at,id) WHERE state IN ('PENDING','SENDING');
CREATE TABLE account_audit (
 id uuid PRIMARY KEY, player_id uuid NOT NULL REFERENCES players(id), event text NOT NULL,
 created_at timestamptz NOT NULL
);

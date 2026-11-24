CREATE TABLE auth_identities (
 provider text NOT NULL CHECK (provider = 'google'),
 subject text NOT NULL CHECK (length(subject) BETWEEN 1 AND 255),
 player_id uuid NOT NULL REFERENCES players(id),
 linked_at timestamptz NOT NULL,
 PRIMARY KEY (provider, subject),
 UNIQUE (player_id, provider)
);

CREATE TABLE google_challenges (
 session_id uuid PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
 purpose text NOT NULL CHECK (purpose IN ('SIGN_IN','LINK','REAUTH')),
 nonce_digest bytea NOT NULL CHECK (octet_length(nonce_digest)=32),
 expires_at timestamptz NOT NULL
);

CREATE INDEX google_challenge_expiry ON google_challenges(expires_at);

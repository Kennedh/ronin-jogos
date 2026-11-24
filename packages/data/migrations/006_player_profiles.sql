ALTER TABLE players
 ADD COLUMN public_profile boolean NOT NULL DEFAULT false,
 ADD COLUMN nickname_changed_at timestamptz;

UPDATE players AS player
SET nickname_changed_at = first_registration.requested_at
FROM (
 SELECT player_id, min(created_at) AS requested_at
 FROM account_audit WHERE event = 'REGISTRATION_REQUESTED'
 GROUP BY player_id
) AS first_registration
WHERE player.id = first_registration.player_id AND player.nickname IS NOT NULL;

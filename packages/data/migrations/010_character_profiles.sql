-- Existing players resolve the catalog defaults at version 1 until their first edit.
CREATE TABLE player_character_profiles (
  player_id uuid PRIMARY KEY REFERENCES players(id),
  appearance_version integer NOT NULL CHECK (appearance_version >= 2),
  slots jsonb NOT NULL CHECK (jsonb_typeof(slots) = 'object')
);

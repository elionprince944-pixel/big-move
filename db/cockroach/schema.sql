-- BIG MOV application tables for CockroachDB.
-- Better Auth owns its user/session/account/verification tables and should
-- generate those from its schema. Apply this only after the auth user table
-- exists; review FK names/types against the generated schema first.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id STRING NOT NULL UNIQUE,
  display_name STRING,
  avatar_url STRING,
  bio STRING,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id STRING NOT NULL,
  role STRING NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles (user_id);

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id STRING NOT NULL,
  tmdb_id INT8 NOT NULL,
  media_type STRING NOT NULL DEFAULT 'movie',
  title STRING NOT NULL,
  poster_path STRING,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, media_type)
);

CREATE INDEX IF NOT EXISTS watchlist_user_added_idx ON watchlist (user_id, added_at DESC);

CREATE TABLE IF NOT EXISTS big_ai_settings (
  id BOOL PRIMARY KEY DEFAULT true CHECK (id = true),
  enabled BOOL NOT NULL DEFAULT true,
  name STRING NOT NULL DEFAULT 'BIG AI',
  welcome_message STRING NOT NULL DEFAULT 'Hi! I can help you discover movies and use BIG MOV.',
  system_prompt STRING NOT NULL DEFAULT 'You are BIG AI, the friendly assistant for BIG MOV. Help users discover movies and TV shows using the context provided. Keep answers concise and useful.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO big_ai_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS big_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id STRING,
  prompt_length INT8 NOT NULL DEFAULT 0,
  response_length INT8 NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS big_ai_usage_created_at_idx ON big_ai_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS big_ai_usage_user_id_idx ON big_ai_usage (user_id);

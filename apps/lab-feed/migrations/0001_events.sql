-- One row per thing that happened. `data` holds the details as JSON; only posts written by people have text.
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  project TEXT,
  source TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  dedupe_key TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  text_en TEXT,
  text_de TEXT,
  hidden INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX events_newest_first ON events (hidden, occurred_at DESC);

-- The latest version and downloads per project, refreshed by the Modrinth poll.
CREATE TABLE project_stats (
  project TEXT PRIMARY KEY,
  version TEXT,
  game_versions TEXT NOT NULL,
  downloads INTEGER,
  updated_at TEXT NOT NULL
);

-- Write access for clients such as the Discord bot. Only the SHA-256 of a token is stored.
CREATE TABLE api_tokens (
  hash TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  scopes TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- GitHub retries a webhook it thinks failed; a delivery id seen before is answered without doing anything twice.
CREATE TABLE github_deliveries (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL
);

-- One row per event and Discord channel it is posted to. A change to the event marks the row unsynced again; the
-- Worker then posts, edits or deletes the message until it matches, and keeps the message id for later changes.
CREATE TABLE outbox (
  event_id TEXT NOT NULL REFERENCES events (id),
  target TEXT NOT NULL,
  message_id TEXT,
  synced INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT NOT NULL,
  last_error TEXT,
  PRIMARY KEY (event_id, target)
);

CREATE INDEX outbox_due ON outbox (synced, next_attempt_at);

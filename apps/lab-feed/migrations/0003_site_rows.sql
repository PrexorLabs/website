-- Events stored before open pages were an outbox target have no row for them, so a later edit or removal never
-- reached the site. They get one, marked as sent: pages that open fetch the current list anyway.
INSERT INTO outbox (event_id, target, synced, next_attempt_at)
SELECT id, 'site', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now') FROM events
-- SQLite needs a WHERE between SELECT and ON CONFLICT to tell the upsert from a join.
WHERE true
ON CONFLICT (event_id, target) DO NOTHING;

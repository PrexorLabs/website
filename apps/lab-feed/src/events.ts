import type { LabEvent, LabEventKind, LabEventSource, Localized, Platform, ProjectStats } from '@prexorlabs/lab';
import { ulid } from './ulid';

export type EventRow = {
  id: string;
  kind: LabEventKind;
  project: string | null;
  source: LabEventSource;
  occurred_at: string;
  data: string;
  text_en: string | null;
  text_de: string | null;
  hidden: number;
};

type NewEvent = Omit<LabEvent, 'id'> & { dedupeKey: string };

export function fromRow(row: EventRow): LabEvent {
  return {
    id: row.id,
    kind: row.kind,
    project: row.project,
    source: row.source,
    occurredAt: row.occurred_at,
    data: JSON.parse(row.data),
    text: row.text_en !== null && row.text_de !== null ? { en: row.text_en, de: row.text_de } : null,
  };
}

// A release older than this is the poll catching up on history, for example when a project first goes public on
// Modrinth, and is not announced again.
const NEWS_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Where an event goes besides the database: open pages of the site, and the Discord channels it is posted to. Ideas
 * come from Discord, so they are not posted back.
 */
function outboxTargets(event: NewEvent): string[] {
  switch (event.kind) {
    case 'release':
      return event.project && Date.now() - Date.parse(event.occurredAt) < NEWS_WINDOW_MS
        ? ['site', `releases:${event.project}`]
        : ['site'];
    case 'idea':
      return ['site'];
    default:
      return ['site', 'announcements'];
  }
}

/**
 * Stores an event unless one with the same dedupe key exists, and queues its delivery in the same batch; returns
 * it only when it is new.
 */
export async function record(db: D1Database, event: NewEvent): Promise<LabEvent | null> {
  const id = ulid();
  const [inserted] = await db.batch<EventRow>([
    db
      .prepare(
        `INSERT INTO events (id, kind, project, source, occurred_at, dedupe_key, data, text_en, text_de)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (dedupe_key) DO NOTHING
         RETURNING *`,
      )
      .bind(
        id,
        event.kind,
        event.project,
        event.source,
        event.occurredAt,
        event.dedupeKey,
        JSON.stringify(event.data),
        event.text?.en ?? null,
        event.text?.de ?? null,
      ),
    ...outboxTargets(event).map((target) =>
      db
        .prepare(
          `INSERT INTO outbox (event_id, target, next_attempt_at)
           SELECT ?1, ?2, ?3 WHERE EXISTS (SELECT 1 FROM events WHERE id = ?1)`,
        )
        .bind(id, target, new Date().toISOString()),
    ),
  ]);
  const row = inserted.results[0];
  return row ? fromRow(row) : null;
}

// One release shows up on several platforms, often with the loader or build in the version (1.4.0-fabric,
// 1.4.0+neoforge, v1.4.0 as a Git tag). They are one release in the feed: the first platform to report it wins.
export function normalizeVersion(version: string): string {
  return version
    .replace(/^v/i, '')
    .replace(/\+.*$/, '')
    .replace(/-(fabric|neoforge|forge|quilt)$/i, '');
}

export function recordRelease(
  db: D1Database,
  release: {
    project: string;
    version: string;
    platform: Platform;
    source: LabEventSource;
    url: string;
    occurredAt: string;
    gameVersions?: string[];
  },
): Promise<LabEvent | null> {
  const version = normalizeVersion(release.version);
  return record(db, {
    kind: 'release',
    project: release.project,
    source: release.source,
    occurredAt: release.occurredAt,
    dedupeKey: `release:${release.project}:${version}`,
    data: { version, platform: release.platform, url: release.url, gameVersions: release.gameVersions },
    text: null,
  });
}

export async function findEvent(db: D1Database, id: string): Promise<LabEvent | null> {
  const row = await db.prepare('SELECT * FROM events WHERE id = ? AND hidden = 0').bind(id).first<EventRow>();
  return row && fromRow(row);
}

export async function listEvents(
  db: D1Database,
  filter: { limit: number; before?: string; project?: string; kind?: string },
): Promise<LabEvent[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM events
       WHERE hidden = 0
         AND (?1 IS NULL OR occurred_at < ?1)
         AND (?2 IS NULL OR project = ?2)
         AND (?3 IS NULL OR kind = ?3)
       ORDER BY occurred_at DESC, id DESC
       LIMIT ?4`,
    )
    .bind(filter.before ?? null, filter.project ?? null, filter.kind ?? null, filter.limit)
    .all<EventRow>();
  return results.map(fromRow);
}

/** Changes an event and queues it again, so open pages and Discord show the change or drop the event. */
export async function changeEvent(
  db: D1Database,
  id: string,
  change: { text?: Localized; hidden?: boolean },
): Promise<LabEvent | null> {
  const [updated] = await db.batch<EventRow>([
    db
      .prepare(
        `UPDATE events
         SET text_en = coalesce(?2, text_en), text_de = coalesce(?3, text_de), hidden = coalesce(?4, hidden)
         WHERE id = ?1
         RETURNING *`,
      )
      .bind(
        id,
        change.text?.en ?? null,
        change.text?.de ?? null,
        change.hidden === undefined ? null : Number(change.hidden),
      ),
    db
      .prepare(
        `UPDATE outbox SET synced = 0, attempts = 0, next_attempt_at = ?2, last_error = NULL WHERE event_id = ?1`,
      )
      .bind(id, new Date().toISOString()),
  ]);
  const row = updated.results[0];
  return row ? fromRow(row) : null;
}

export async function saveStats(db: D1Database, stats: Omit<ProjectStats, 'updatedAt'>): Promise<void> {
  await db
    .prepare(
      `INSERT INTO project_stats (project, version, game_versions, downloads, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (project) DO UPDATE SET
         version = excluded.version, game_versions = excluded.game_versions,
         downloads = excluded.downloads, updated_at = excluded.updated_at`,
    )
    .bind(stats.project, stats.version, JSON.stringify(stats.gameVersions), stats.downloads, new Date().toISOString())
    .run();
}

export async function listStats(db: D1Database): Promise<ProjectStats[]> {
  const { results } = await db.prepare('SELECT * FROM project_stats ORDER BY project').all<{
    project: string;
    version: string | null;
    game_versions: string;
    downloads: number | null;
    updated_at: string;
  }>();
  return results.map((row) => ({
    project: row.project,
    version: row.version,
    gameVersions: JSON.parse(row.game_versions),
    downloads: row.downloads,
    updatedAt: row.updated_at,
  }));
}

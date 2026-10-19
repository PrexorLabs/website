import type { LabEvent, LabEventKind, LabEventSource, Localized, Platform, ProjectStats } from '@prexorlabs/lab';
import { ulid } from './ulid';

type EventRow = {
  id: string;
  kind: LabEventKind;
  project: string | null;
  source: LabEventSource;
  occurred_at: string;
  data: string;
  text_en: string | null;
  text_de: string | null;
};

type NewEvent = Omit<LabEvent, 'id'> & { dedupeKey: string };

function fromRow(row: EventRow): LabEvent {
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

/** Stores an event unless one with the same dedupe key exists; returns it only when it is new. */
export async function record(db: D1Database, event: NewEvent): Promise<LabEvent | null> {
  const row = await db
    .prepare(
      `INSERT INTO events (id, kind, project, source, occurred_at, dedupe_key, data, text_en, text_de)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (dedupe_key) DO NOTHING
       RETURNING *`,
    )
    .bind(
      ulid(),
      event.kind,
      event.project,
      event.source,
      event.occurredAt,
      event.dedupeKey,
      JSON.stringify(event.data),
      event.text?.en ?? null,
      event.text?.de ?? null,
    )
    .first<EventRow>();
  return row && fromRow(row);
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

export async function changeEvent(
  db: D1Database,
  id: string,
  change: { text?: Localized; hidden?: boolean },
): Promise<LabEvent | null> {
  const row = await db
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
    )
    .first<EventRow>();
  return row && fromRow(row);
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

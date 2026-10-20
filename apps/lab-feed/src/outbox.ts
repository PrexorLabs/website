import { describe, type LabEvent } from '@prexorlabs/lab';
import type { DiscordConfig } from './discord';
import { type EventRow, fromRow } from './events';
import type { Env } from './index';
import { projectName } from './projects';

const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 10;
// A claimed row is skipped by other runs for this long, so the minute cron and a delivery right after a request
// never post the same message twice.
const LEASE_MS = 2 * 60 * 1000;

type OutboxRow = { event_id: string; target: string; message_id: string | null; attempts: number };

function pingedRole(target: string, discord: DiscordConfig): string | undefined {
  if (target === 'announcements') return discord.news;
  return discord.projects[target.replace(/^releases:/, '')]?.updates;
}

function message(event: LabEvent, role: string | undefined) {
  const text = describe(event, 'en', projectName(event.project));
  return {
    content: [role ? `<@&${role}> ${text}` : text, event.data.url].filter(Boolean).join('\n'),
    allowed_mentions: { roles: role ? [role] : [] },
  };
}

async function callWebhook(url: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // A message someone already deleted by hand is as good as deleted.
  if (!response.ok && !(method === 'DELETE' && response.status === 404)) {
    throw new Error(`Discord answered ${response.status} to ${method}: ${await response.text()}`);
  }
  return response;
}

/** Brings one Discord message in line with its event and returns the message id, or null once it is gone. */
async function sync(env: Env, entry: OutboxRow, event: EventRow, webhook: string | undefined): Promise<string | null> {
  if (!webhook) throw new Error(`No webhook for ${entry.target}`);
  if (event.hidden) {
    if (entry.message_id) await callWebhook(`${webhook}/messages/${entry.message_id}`, 'DELETE');
    return null;
  }
  const body = message(fromRow(event), pingedRole(entry.target, env.DISCORD));
  if (entry.message_id) {
    await callWebhook(`${webhook}/messages/${entry.message_id}`, 'PATCH', body);
    return entry.message_id;
  }
  const sent = await callWebhook(`${webhook}?wait=true`, 'POST', body);
  return (await sent.json<{ id: string }>()).id;
}

/** Posts, edits or deletes the Discord messages of new and changed events; failures wait twice as long each time. */
export async function deliverDue(env: Env): Promise<void> {
  const now = Date.now();
  const lease = new Date(now + LEASE_MS).toISOString();
  const { results: due } = await env.LAB.prepare(
    `UPDATE outbox SET next_attempt_at = ?1
     WHERE rowid IN (
       SELECT rowid FROM outbox WHERE synced = 0 AND attempts < ?2 AND next_attempt_at <= ?3 LIMIT ?4
     )
     RETURNING event_id, target, message_id, attempts`,
  )
    .bind(lease, MAX_ATTEMPTS, new Date(now).toISOString(), BATCH_SIZE)
    .all<OutboxRow>();
  if (due.length === 0) return;

  const webhooks: Record<string, string> = JSON.parse(env.DISCORD_WEBHOOKS);
  for (const entry of due) {
    const event = await env.LAB.prepare('SELECT * FROM events WHERE id = ?').bind(entry.event_id).first<EventRow>();
    try {
      const messageId = await sync(env, entry, event!, webhooks[entry.target]);
      // An edit that came in meanwhile moved next_attempt_at off the lease: the row stays unsynced and goes out again.
      await env.LAB.prepare(
        `UPDATE outbox SET message_id = ?3, synced = (next_attempt_at = ?4), last_error = NULL
         WHERE event_id = ?1 AND target = ?2`,
      )
        .bind(entry.event_id, entry.target, messageId, lease)
        .run();
    } catch (error) {
      await env.LAB.prepare(
        `UPDATE outbox SET attempts = attempts + 1, next_attempt_at = ?3, last_error = ?4
         WHERE event_id = ?1 AND target = ?2 AND next_attempt_at = ?5`,
      )
        .bind(
          entry.event_id,
          entry.target,
          new Date(now + 2 ** entry.attempts * 60_000).toISOString(),
          String(error),
          lease,
        )
        .run();
    }
  }
}

import { env, SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';
import { recordRelease } from '../src/events';
import { sha256 } from '../src/tokens';

const post = { kind: 'post', text: { en: 'Something is coming.', de: 'Es kommt etwas.' } };

async function addToken(token: string, scopes: string) {
  await env.LAB.prepare('INSERT INTO api_tokens (hash, name, scopes, created_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(token), 'test', scopes, new Date().toISOString())
    .run();
}

function call(path: string, init: RequestInit & { token?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.token) headers.set('Authorization', `Bearer ${init.token}`);
  return SELF.fetch(`https://lab${path}`, { ...init, headers });
}

beforeEach(async () => {
  await addToken('writer', 'events:write');
  await addToken('moderator', 'events:write events:hide');
});

describe('reading', () => {
  it('lists events newest first and pages with before', async () => {
    for (const [version, day] of [
      ['1.0.0', '01'],
      ['1.1.0', '02'],
      ['1.2.0', '03'],
    ]) {
      await recordRelease(env.LAB, {
        project: 'serverlistplus',
        version,
        platform: 'modrinth',
        source: 'modrinth',
        url: 'https://example.com',
        occurredAt: `2026-10-${day}T00:00:00Z`,
      });
    }
    const first = await (
      await call('/v1/events?limit=2')
    ).json<{ events: { data: { version: string }; occurredAt: string }[] }>();
    expect(first.events.map((event) => event.data.version)).toEqual(['1.2.0', '1.1.0']);

    const rest = await (
      await call(`/v1/events?limit=2&before=${first.events[1].occurredAt}`)
    ).json<{ events: unknown[] }>();
    expect(rest.events).toHaveLength(1);
  });

  it('serves an Atom feed in the requested language', async () => {
    await recordRelease(env.LAB, {
      project: 'serverlistplus',
      version: '1.0.0',
      platform: 'modrinth',
      source: 'modrinth',
      url: 'https://example.com',
      occurredAt: '2026-10-01T00:00:00Z',
    });
    const feed = await (await call('/v1/feed.xml?lang=de')).text();
    expect(feed).toContain('<title>ServerListPlus 1.0.0 ist auf Modrinth erschienen.</title>');
  });
});

describe('writing', () => {
  it('refuses a post without a token', async () => {
    const response = await call('/v1/events', { method: 'POST', body: JSON.stringify(post) });
    expect(response.status).toBe(401);
  });

  it('creates a post with both languages', async () => {
    const response = await call('/v1/events', { method: 'POST', body: JSON.stringify(post), token: 'writer' });
    expect(response.status).toBe(201);
    const { event } = await response.json<{ event: { text: unknown } }>();
    expect(event.text).toEqual(post.text);
  });

  it('refuses a post with only one language', async () => {
    const body = JSON.stringify({ kind: 'post', text: { en: 'English only' } });
    expect((await call('/v1/events', { method: 'POST', body, token: 'writer' })).status).toBe(400);
  });

  it('lets only a token with the hide scope remove an event', async () => {
    const { event } = await (
      await call('/v1/events', { method: 'POST', body: JSON.stringify(post), token: 'writer' })
    ).json<{ event: { id: string } }>();

    expect((await call(`/v1/events/${event.id}`, { method: 'DELETE', token: 'writer' })).status).toBe(401);
    expect((await call(`/v1/events/${event.id}`, { method: 'DELETE', token: 'moderator' })).status).toBe(200);

    const { events } = await (await call('/v1/events')).json<{ events: unknown[] }>();
    expect(events).toHaveLength(0);
  });
});

import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { changeEvent, record, recordRelease } from '../src/events';
import { deliverDue } from '../src/outbox';

type Call = { url: string; method: string; body: { content: string; allowed_mentions: { roles: string[] } } | null };

function discord(status = 200) {
  const calls: Call[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    calls.push({
      url: input.toString(),
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(init.body as string) : null,
    });
    return status === 200 ? Response.json({ id: 'message-1' }) : new Response('Discord is down', { status });
  });
  return calls;
}

function post() {
  return record(env.LAB, {
    kind: 'post',
    project: null,
    source: 'api',
    occurredAt: new Date().toISOString(),
    dedupeKey: 'api:1',
    data: { url: 'https://prexorlabs.dev/lab/groups/' },
    text: { en: 'Groups are coming.', de: 'Gruppen kommen.' },
  });
}

function outbox() {
  return env.LAB.prepare('SELECT * FROM outbox').first<{ message_id: string; synced: number; attempts: number }>();
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('deliverDue', () => {
  it('posts a new event once and pings only its role', async () => {
    const calls = discord();
    await post();
    await deliverDue(env);
    await deliverDue(env);

    expect(calls).toEqual([
      {
        url: 'https://discord.test/webhooks/1/announcements?wait=true',
        method: 'POST',
        body: {
          content: '<@&news> Groups are coming.\nhttps://prexorlabs.dev/lab/groups/',
          allowed_mentions: { roles: ['news'] },
        },
      },
    ]);
    expect(await outbox()).toMatchObject({ message_id: 'message-1', synced: 1 });
  });

  it('edits the message after the event changed and deletes it once hidden', async () => {
    const calls = discord();
    const event = await post();
    await deliverDue(env);

    await changeEvent(env.LAB, event!.id, { text: { en: 'Groups are here.', de: 'Gruppen sind da.' } });
    await deliverDue(env);
    await changeEvent(env.LAB, event!.id, { hidden: true });
    await deliverDue(env);

    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      'POST https://discord.test/webhooks/1/announcements?wait=true',
      'PATCH https://discord.test/webhooks/1/announcements/messages/message-1',
      'DELETE https://discord.test/webhooks/1/announcements/messages/message-1',
    ]);
    expect(calls[1].body?.content).toContain('Groups are here.');
  });

  it('waits before trying a failed message again', async () => {
    const calls = discord(500);
    await post();
    await deliverDue(env);
    await deliverDue(env);

    expect(calls).toHaveLength(1);
    expect(await outbox()).toMatchObject({ synced: 0, attempts: 1 });
  });

  it('announces a new release in the project channel but not one from the past', async () => {
    const calls = discord();
    for (const [version, occurredAt] of [
      ['1.0.0', '2026-01-01T00:00:00Z'],
      ['1.5.0', new Date().toISOString()],
    ]) {
      await recordRelease(env.LAB, {
        project: 'serverlistplus',
        version,
        platform: 'github',
        source: 'github',
        url: `https://github.com/PrexorLabs/ServerListPlus/releases/tag/v${version}`,
        occurredAt,
      });
    }
    await deliverDue(env);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://discord.test/webhooks/2/slp?wait=true');
    expect(calls[0].body?.content).toBe(
      '<@&slp-updates> ServerListPlus 1.5.0 is out on GitHub.\nhttps://github.com/PrexorLabs/ServerListPlus/releases/tag/v1.5.0',
    );
  });
});

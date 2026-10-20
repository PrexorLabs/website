import { env, SELF } from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listEvents, record } from '../src/events';

const bytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (pair) => parseInt(pair, 16));
const hex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');

async function interact(interaction: object, options: { timestamp?: number; tamper?: boolean } = {}) {
  const body = JSON.stringify({ id: crypto.randomUUID(), member: { roles: ['founder'] }, data: {}, ...interaction });
  const timestamp = String(options.timestamp ?? Math.floor(Date.now() / 1000));
  const key = await crypto.subtle.importKey('pkcs8', bytes(env.TEST_DISCORD_PRIVATE_KEY), { name: 'Ed25519' }, false, [
    'sign',
  ]);
  const signature = await crypto.subtle.sign('Ed25519', key, new TextEncoder().encode(timestamp + body));
  return SELF.fetch('https://lab/discord/interactions', {
    method: 'POST',
    headers: { 'X-Signature-Ed25519': hex(signature), 'X-Signature-Timestamp': timestamp },
    body: options.tamper ? body.replace('founder', 'someone') : body,
  });
}

function command(name: string, options: { name: string; value: string; focused?: boolean }[] = []) {
  return { type: 2, data: { options: [{ name, options }] } };
}

function form(customId: string, values: Record<string, string>) {
  return {
    type: 5,
    data: {
      custom_id: customId,
      components: Object.entries(values).map(([id, value]) => ({ components: [{ custom_id: id, value }] })),
    },
  };
}

async function outbox() {
  const { results } = await env.LAB.prepare('SELECT event_id, target, synced FROM outbox').all();
  return results;
}

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ id: 'message' }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Discord interactions', () => {
  it('answers the ping Discord sends when the endpoint is set', async () => {
    const response = await interact({ type: 1 });
    expect(await response.json()).toEqual({ type: 1 });
  });

  it('refuses a request whose body does not match the signature', async () => {
    expect((await interact({ type: 1 }, { tamper: true })).status).toBe(401);
  });

  it('refuses a signed request older than five minutes', async () => {
    const response = await interact({ type: 1 }, { timestamp: Math.floor(Date.now() / 1000) - 6 * 60 });
    expect(response.status).toBe(401);
  });

  it('opens a form for both languages on /lab post', async () => {
    const response = await interact(command('post', [{ name: 'kind', value: 'teaser' }]));
    const { type, data } = await response.json<{ type: number; data: { custom_id: string } }>();
    expect(type).toBe(9);
    expect(data.custom_id).toBe('post:teaser:');
  });

  it('posts what the form sends once, and queues it for #announcements', async () => {
    const submission = {
      id: 'interaction-1',
      ...form('post:post:serverlistplus', { en: 'Groups are coming.', de: 'Gruppen kommen.', url: '' }),
    };
    await interact(submission);
    await interact(submission);

    const events = await listEvents(env.LAB, { limit: 10 });
    expect(events).toMatchObject([
      { kind: 'post', project: 'serverlistplus', source: 'discord', text: { en: 'Groups are coming.' } },
    ]);
    expect(await outbox()).toMatchObject([{ event_id: events[0].id, target: 'announcements' }]);
  });

  it('refuses /lab to members without an editor role', async () => {
    const response = await interact({
      member: { roles: ['member'] },
      ...form('post:post:', { en: 'Hello', de: 'Hallo' }),
    });
    const { data } = await response.json<{ data: { content: string } }>();
    expect(data.content).toBe('Only Founder and Admin can use /lab.');
    expect(await listEvents(env.LAB, { limit: 10 })).toHaveLength(0);
  });

  it('offers recent posts when choosing one to edit', async () => {
    await record(env.LAB, {
      kind: 'post',
      project: null,
      source: 'discord',
      occurredAt: new Date().toISOString(),
      dedupeKey: 'discord:a',
      data: {},
      text: { en: 'Groups are coming.', de: 'Gruppen kommen.' },
    });
    const response = await interact({ ...command('edit', [{ name: 'post', value: 'group', focused: true }]), type: 4 });
    const { data } = await response.json<{ data: { choices: { name: string }[] } }>();
    expect(data.choices.map((choice) => choice.name)).toEqual(['Groups are coming.']);
  });

  it('changes the text on /lab edit and removes the post on /lab delete', async () => {
    const event = await record(env.LAB, {
      kind: 'post',
      project: null,
      source: 'discord',
      occurredAt: new Date().toISOString(),
      dedupeKey: 'discord:a',
      data: {},
      text: { en: 'Groups are coming.', de: 'Gruppen kommen.' },
    });
    await interact(form(`edit:${event!.id}`, { en: 'Groups are here.', de: 'Gruppen sind da.' }));
    expect((await listEvents(env.LAB, { limit: 1 }))[0].text).toEqual({
      en: 'Groups are here.',
      de: 'Gruppen sind da.',
    });

    await interact(command('delete', [{ name: 'post', value: event!.id }]));
    expect(await listEvents(env.LAB, { limit: 1 })).toHaveLength(0);
  });
});

import type { LabLiveMessage } from '@prexorlabs/lab';
import { env, SELF } from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { changeEvent, record } from '../src/events';
import { deliverDue } from '../src/outbox';

async function listen() {
  const response = await SELF.fetch('https://lab/v1/live', { headers: { Upgrade: 'websocket' } });
  const socket = response.webSocket!;
  const messages: LabLiveMessage[] = [];
  socket.addEventListener('message', (message) => messages.push(JSON.parse(message.data as string)));
  socket.accept();
  return { socket, messages };
}

function post() {
  return record(env.LAB, {
    kind: 'post',
    project: null,
    source: 'api',
    occurredAt: new Date().toISOString(),
    dedupeKey: 'api:1',
    data: {},
    text: { en: 'Groups are coming.', de: 'Gruppen kommen.' },
  });
}

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ id: 'message' }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('live updates', () => {
  it('sends open pages a new post, its edit and its removal', async () => {
    const { socket, messages } = await listen();
    const event = await post();
    await deliverDue(env);
    await changeEvent(env.LAB, event!.id, { text: { en: 'Groups are here.', de: 'Gruppen sind da.' } });
    await deliverDue(env);
    await changeEvent(env.LAB, event!.id, { hidden: true });
    await deliverDue(env);
    await vi.waitFor(() => expect(messages).toHaveLength(3));

    expect(messages).toEqual([
      { event: expect.objectContaining({ id: event!.id, text: { en: 'Groups are coming.', de: 'Gruppen kommen.' } }) },
      { event: expect.objectContaining({ id: event!.id, text: { en: 'Groups are here.', de: 'Gruppen sind da.' } }) },
      { hidden: event!.id },
    ]);
    socket.close();
  });

  it('refuses a plain request to the live address', async () => {
    expect((await SELF.fetch('https://lab/v1/live')).status).toBe(426);
  });
});

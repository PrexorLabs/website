import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { listEvents, listStats } from '../src/events';
import { pollModrinth } from '../src/modrinth';

function answer(routes: Record<string, unknown>) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const path = new URL(input instanceof Request ? input.url : input.toString()).pathname;
    return path in routes ? Response.json(routes[path]) : new Response('Not found', { status: 404 });
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('pollModrinth', () => {
  it('records each release once and keeps the newest version and downloads', async () => {
    answer({
      '/v2/project/server-list-plus': { downloads: 1234 },
      '/v2/project/server-list-plus/version': [
        { id: 'b', version_number: '1.4.0-neoforge', game_versions: ['26.3'], date_published: '2026-10-03T09:00:00Z' },
        { id: 'a', version_number: '1.4.0-fabric', game_versions: ['26.3'], date_published: '2026-10-03T08:00:00Z' },
        { id: 'z', version_number: '1.3.0-fabric', game_versions: ['26.2'], date_published: '2026-09-01T08:00:00Z' },
      ],
    });

    await pollModrinth(env.LAB);
    await pollModrinth(env.LAB);

    const events = await listEvents(env.LAB, { limit: 10 });
    expect(events.map((event) => event.data.version)).toEqual(['1.4.0', '1.3.0']);
    expect(events[0].occurredAt).toBe('2026-10-03T08:00:00Z');
    expect(await listStats(env.LAB)).toMatchObject([{ project: 'serverlistplus', version: '1.4.0', downloads: 1234 }]);
  });

  it('does nothing while the project is not public', async () => {
    answer({});
    await pollModrinth(env.LAB);
    expect(await listEvents(env.LAB, { limit: 10 })).toHaveLength(0);
    expect(await listStats(env.LAB)).toHaveLength(0);
  });
});

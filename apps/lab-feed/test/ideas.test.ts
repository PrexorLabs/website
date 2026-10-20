import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { listEvents } from '../src/events';
import { pollIdeas } from '../src/ideas';

const tags = [
  { id: 'suggestion', name: 'Suggestion' },
  { id: 'planned', name: 'Planned' },
  { id: 'done', name: 'Done' },
];

function forum(active: object[], archived: object[] = []) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const path = new URL(input.toString()).pathname;
    if (path === '/api/v10/guilds/guild/threads/active') return Response.json({ threads: active });
    if (path === '/api/v10/channels/slp-ideas') return Response.json({ available_tags: tags });
    if (path === '/api/v10/channels/slp-ideas/threads/archived/public') return Response.json({ threads: archived });
    return new Response('Not found', { status: 404 });
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('pollIdeas', () => {
  it('records planned and done ideas once, by title only', async () => {
    forum(
      [
        { id: '1', parent_id: 'slp-ideas', name: 'Server folders', applied_tags: ['suggestion', 'planned'] },
        { id: '2', parent_id: 'slp-ideas', name: 'Dark mode', applied_tags: ['suggestion'] },
        { id: '3', parent_id: 'general', name: 'Not an idea', applied_tags: ['planned'] },
      ],
      [{ id: '4', parent_id: 'slp-ideas', name: 'Search by MOTD', applied_tags: ['done'] }],
    );
    await pollIdeas(env);
    await pollIdeas(env);

    const events = await listEvents(env.LAB, { limit: 10 });
    expect(events.map((event) => event.data).toSorted((a, b) => a.title!.localeCompare(b.title!))).toEqual([
      { title: 'Search by MOTD', status: 'done' },
      { title: 'Server folders', status: 'planned' },
    ]);
  });

  it('records an idea again when it moves from planned to done', async () => {
    forum([{ id: '1', parent_id: 'slp-ideas', name: 'Server folders', applied_tags: ['planned'] }]);
    await pollIdeas(env);
    vi.restoreAllMocks();
    forum([{ id: '1', parent_id: 'slp-ideas', name: 'Server folders', applied_tags: ['done'] }]);
    await pollIdeas(env);

    const events = await listEvents(env.LAB, { kind: 'idea', limit: 10 });
    expect(events.map((event) => event.data.status).toSorted()).toEqual(['done', 'planned']);
  });
});

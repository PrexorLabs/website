import type { Locale } from '@prexorlabs/lab';
import * as v from 'valibot';
import { answerInteraction, type DiscordConfig } from './discord';
import { changeEvent, listEvents, listStats, record } from './events';
import { atomFeed, jsonFeed } from './feeds';
import { handleGitHub } from './github';
import { pollIdeas } from './ideas';
import type { LabLive } from './live';
import { pollModrinth } from './modrinth';
import { deliverDue } from './outbox';
import { NewPost, PostChange } from './posts';
import { authorized } from './tokens';
import { ulid } from './ulid';

export type Env = {
  LAB: D1Database;
  GITHUB_WEBHOOK_SECRET: string;
  SITE_URL: string;
  LIVE: DurableObjectNamespace<LabLive>;
  DISCORD: DiscordConfig;
  DISCORD_BOT_TOKEN: string;
  /** JSON object from outbox target (`announcements`, `releases:<project>`) to the channel's webhook URL. */
  DISCORD_WEBHOOKS: string;
};

function json(body: unknown, status = 200, cache = false): Response {
  return Response.json(body, {
    status,
    headers: cache ? { 'Cache-Control': 'public, max-age=60' } : { 'Cache-Control': 'no-store' },
  });
}

function locale(url: URL): Locale {
  return url.searchParams.get('lang') === 'de' ? 'de' : 'en';
}

async function readBody<T extends v.GenericSchema>(
  request: Request,
  schema: T,
): Promise<{ ok: true; value: v.InferOutput<T> } | { ok: false; error: string }> {
  const parsed = v.safeParse(schema, await request.json().catch(() => undefined));
  return parsed.success ? { ok: true, value: parsed.output } : { ok: false, error: v.summarize(parsed.issues) };
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const eventPath = url.pathname.match(/^\/v1\/events\/([0-9A-Z]{26})$/);

  if (request.method === 'GET' && url.pathname === '/v1/events') {
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 100);
    const events = await listEvents(env.LAB, {
      limit,
      before: url.searchParams.get('before') ?? undefined,
      project: url.searchParams.get('project') ?? undefined,
      kind: url.searchParams.get('kind') ?? undefined,
    });
    return json({ events }, 200, true);
  }

  if (request.method === 'GET' && url.pathname === '/v1/live') {
    if (request.headers.get('Upgrade') !== 'websocket') return json({ error: 'Expected a WebSocket' }, 426);
    return env.LIVE.getByName('lab').fetch(request);
  }

  if (request.method === 'GET' && url.pathname === '/v1/projects') {
    return json({ projects: await listStats(env.LAB) }, 200, true);
  }

  if (request.method === 'GET' && (url.pathname === '/v1/feed.xml' || url.pathname === '/v1/feed.json')) {
    const events = await listEvents(env.LAB, { limit: 50 });
    if (url.pathname.endsWith('.json')) return json(jsonFeed(events, locale(url), env.SITE_URL), 200, true);
    return new Response(atomFeed(events, locale(url), env.SITE_URL), {
      headers: { 'Content-Type': 'application/atom+xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' },
    });
  }

  if (request.method === 'POST' && url.pathname === '/v1/events') {
    if (!(await authorized(request, env.LAB, 'events:write'))) return json({ error: 'Not allowed' }, 401);
    const body = await readBody(request, NewPost);
    if (!body.ok) return json({ error: body.error }, 400);
    const event = await record(env.LAB, {
      kind: body.value.kind,
      project: body.value.project ?? null,
      source: 'api',
      occurredAt: new Date().toISOString(),
      dedupeKey: `api:${ulid()}`,
      data: { url: body.value.url },
      text: body.value.text,
    });
    return json({ event }, 201);
  }

  if (eventPath && request.method === 'DELETE') {
    if (!(await authorized(request, env.LAB, 'events:hide'))) return json({ error: 'Not allowed' }, 401);
    const event = await changeEvent(env.LAB, eventPath[1], { hidden: true });
    return event ? json({ event }) : json({ error: 'No such event' }, 404);
  }

  if (eventPath && request.method === 'PATCH') {
    const body = await readBody(request, PostChange);
    if (!body.ok) return json({ error: body.error }, 400);
    const scope = body.value.hidden === undefined ? 'events:write' : 'events:hide';
    if (!(await authorized(request, env.LAB, scope))) return json({ error: 'Not allowed' }, 401);
    const event = await changeEvent(env.LAB, eventPath[1], body.value);
    return event ? json({ event }) : json({ error: 'No such event' }, 404);
  }

  if (request.method === 'POST' && url.pathname === '/webhooks/github') {
    return handleGitHub(request, env.LAB, env.GITHUB_WEBHOOK_SECRET);
  }

  if (request.method === 'POST' && url.pathname === '/discord/interactions') {
    return answerInteraction(request, env);
  }

  return json({ error: 'Not found' }, 404);
}

export { LabLive } from './live';

export default {
  async fetch(request, env, context): Promise<Response> {
    const response = await route(request, env);
    // Anything that wrote may have queued a Discord message; the minute cron retries what fails here.
    if (request.method !== 'GET' && response.ok) context.waitUntil(deliverDue(env));
    return response;
  },

  async scheduled(controller, env, context) {
    switch (controller.cron) {
      case '* * * * *':
        context.waitUntil(deliverDue(env));
        break;
      case '*/10 * * * *':
        context.waitUntil(pollModrinth(env.LAB));
        break;
      case '0 * * * *':
        context.waitUntil(pollIdeas(env));
        break;
    }
  },
} satisfies ExportedHandler<Env>;

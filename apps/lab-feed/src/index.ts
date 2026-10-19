import type { Locale } from '@prexorlabs/lab';
import * as v from 'valibot';
import { changeEvent, listEvents, listStats, record } from './events';
import { atomFeed, jsonFeed } from './feeds';
import { handleGitHub } from './github';
import { pollModrinth } from './modrinth';
import { projects } from './projects';
import { authorized } from './tokens';
import { ulid } from './ulid';

export type Env = {
  LAB: D1Database;
  GITHUB_WEBHOOK_SECRET: string;
  SITE_URL: string;
};

const text = v.object({
  en: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(500)),
  de: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(500)),
});

const NewPost = v.object({
  kind: v.picklist(['post', 'teaser']),
  project: v.optional(v.nullable(v.picklist(projects.map((project) => project.id)))),
  text,
  url: v.optional(v.pipe(v.string(), v.url())),
});

const PostChange = v.object({ text: v.optional(text), hidden: v.optional(v.boolean()) });

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

export default {
  async fetch(request, env): Promise<Response> {
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

    return json({ error: 'Not found' }, 404);
  },

  async scheduled(_controller, env, context) {
    context.waitUntil(pollModrinth(env.LAB));
  },
} satisfies ExportedHandler<Env>;

import { recordRelease } from './events';
import { projects } from './projects';

const encoder = new TextEncoder();

/** Checks GitHub's `X-Hub-Signature-256` header, an HMAC-SHA256 of the raw body with the webhook secret. */
export async function verifySignature(secret: string, body: string, header: string | null): Promise<boolean> {
  if (!header?.startsWith('sha256=')) return false;
  const signature = Uint8Array.from(header.slice(7).match(/../g) ?? [], (pair) => parseInt(pair, 16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'verify',
  ]);
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(body));
}

type ReleaseEvent = {
  action: string;
  release: {
    id: number;
    tag_name: string;
    html_url: string;
    published_at: string;
    draft: boolean;
    prerelease: boolean;
  };
  repository: { full_name: string };
};

export async function handleGitHub(request: Request, db: D1Database, secret: string): Promise<Response> {
  const body = await request.text();
  if (!(await verifySignature(secret, body, request.headers.get('X-Hub-Signature-256')))) {
    return new Response('Signature does not match', { status: 401 });
  }

  const delivery = request.headers.get('X-GitHub-Delivery');
  if (!delivery) return new Response('Delivery id missing', { status: 400 });
  const firstTime = await db
    .prepare('INSERT INTO github_deliveries (id, received_at) VALUES (?, ?) ON CONFLICT (id) DO NOTHING RETURNING id')
    .bind(delivery, new Date().toISOString())
    .first();
  if (!firstTime) return new Response(null, { status: 204 });

  if (request.headers.get('X-GitHub-Event') !== 'release') return new Response(null, { status: 204 });
  const event: ReleaseEvent = JSON.parse(body);
  const project = projects.find((entry) => entry.github?.toLowerCase() === event.repository.full_name.toLowerCase());
  if (event.action !== 'published' || event.release.draft || event.release.prerelease || !project) {
    return new Response(null, { status: 204 });
  }

  await recordRelease(db, {
    project: project.id,
    version: event.release.tag_name,
    platform: 'github',
    source: 'github',
    url: event.release.html_url,
    occurredAt: event.release.published_at,
  });
  return new Response(null, { status: 204 });
}

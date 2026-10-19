import { env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { listEvents } from '../src/events';

async function sign(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('test-secret'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return 'sha256=' + Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function releasePayload(overrides: { prerelease?: boolean; repository?: string } = {}) {
  return JSON.stringify({
    action: 'published',
    release: {
      id: 1,
      tag_name: 'v1.5.0',
      html_url: 'https://github.com/PrexorLabs/ServerListPlus/releases/tag/v1.5.0',
      published_at: '2026-10-02T12:00:00Z',
      draft: false,
      prerelease: overrides.prerelease ?? false,
    },
    repository: { full_name: overrides.repository ?? 'PrexorLabs/ServerListPlus' },
  });
}

async function deliver(body: string, delivery: string, signature?: string) {
  return SELF.fetch('https://lab/webhooks/github', {
    method: 'POST',
    headers: {
      'X-GitHub-Event': 'release',
      'X-GitHub-Delivery': delivery,
      'X-Hub-Signature-256': signature ?? (await sign(body)),
    },
    body,
  });
}

describe('GitHub webhook', () => {
  it('rejects a body that does not match its signature', async () => {
    const response = await deliver(releasePayload(), 'delivery-1', await sign('something else'));
    expect(response.status).toBe(401);
    expect(await listEvents(env.LAB, { limit: 10 })).toHaveLength(0);
  });

  it('records a published release of a known project', async () => {
    expect((await deliver(releasePayload(), 'delivery-2')).status).toBe(204);
    const [event] = await listEvents(env.LAB, { limit: 10 });
    expect(event).toMatchObject({
      kind: 'release',
      project: 'serverlistplus',
      data: { version: '1.5.0', platform: 'github' },
    });
  });

  it('ignores a delivery it has seen before', async () => {
    await deliver(releasePayload(), 'delivery-3');
    await env.LAB.prepare('DELETE FROM events').run();
    await deliver(releasePayload(), 'delivery-3');
    expect(await listEvents(env.LAB, { limit: 10 })).toHaveLength(0);
  });

  it('skips prereleases and repositories that are not in the inventory', async () => {
    await deliver(releasePayload({ prerelease: true }), 'delivery-4');
    await deliver(releasePayload({ repository: 'someone/else' }), 'delivery-5');
    expect(await listEvents(env.LAB, { limit: 10 })).toHaveLength(0);
  });
});

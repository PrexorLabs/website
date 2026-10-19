import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { listEvents, normalizeVersion, recordRelease } from '../src/events';

describe('normalizeVersion', () => {
  it.each([
    ['v1.4.0', '1.4.0'],
    ['1.4.0-fabric', '1.4.0'],
    ['1.4.0-NeoForge', '1.4.0'],
    ['1.4.0+mc26.3', '1.4.0'],
    ['2.0.0-beta.1', '2.0.0-beta.1'],
  ])('reads %s as %s', (raw, normalized) => {
    expect(normalizeVersion(raw)).toBe(normalized);
  });
});

describe('recordRelease', () => {
  it('keeps one event when the same version arrives from several platforms', async () => {
    const release = { project: 'serverlistplus', url: 'https://example.com', occurredAt: '2026-10-01T10:00:00Z' };
    const first = await recordRelease(env.LAB, {
      ...release,
      version: '1.4.0-fabric',
      platform: 'modrinth',
      source: 'modrinth',
    });
    const second = await recordRelease(env.LAB, {
      ...release,
      version: 'v1.4.0',
      platform: 'github',
      source: 'github',
    });

    expect(first?.data).toMatchObject({ version: '1.4.0', platform: 'modrinth' });
    expect(second).toBeNull();
    expect(await listEvents(env.LAB, { limit: 10 })).toHaveLength(1);
  });
});

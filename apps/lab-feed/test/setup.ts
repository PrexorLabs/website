import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeEach } from 'vitest';

await applyD1Migrations(env.LAB, env.MIGRATIONS);

// Storage lives as long as a test file, so every test starts from empty tables.
beforeEach(async () => {
  await env.LAB.batch(
    ['events', 'project_stats', 'api_tokens', 'github_deliveries'].map((table) =>
      env.LAB.prepare(`DELETE FROM ${table}`),
    ),
  );
});

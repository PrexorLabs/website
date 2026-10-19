import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig, type Plugin } from 'vitest/config';

// Matches the Text rule for *.yaml in wrangler.jsonc, so tests read the inventory the same way the Worker does.
const yamlAsText: Plugin = {
  name: 'yaml-as-text',
  transform: (code, id) => (id.endsWith('.yaml') ? `export default ${JSON.stringify(code)};` : undefined),
};

export default defineConfig(async () => ({
  plugins: [
    yamlAsText,
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: { MIGRATIONS: await readD1Migrations('./migrations'), GITHUB_WEBHOOK_SECRET: 'test-secret' },
      },
    }),
  ],
  test: { setupFiles: ['./test/setup.ts'] },
}));

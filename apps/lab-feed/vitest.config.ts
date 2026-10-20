import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { generateKeyPairSync } from 'node:crypto';
import { defineConfig, type Plugin } from 'vitest/config';

// Matches the Text rule for *.yaml in wrangler.jsonc, so tests read the inventory the same way the Worker does.
const yamlAsText: Plugin = {
  name: 'yaml-as-text',
  transform: (code, id) => (id.endsWith('.yaml') ? `export default ${JSON.stringify(code)};` : undefined),
};

// Tests sign interactions with their own key in place of Discord's.
const discordKey = generateKeyPairSync('ed25519');
const testDiscord = {
  guild: 'guild',
  publicKey: discordKey.publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('hex'),
  editors: ['founder'],
  news: 'news',
  projects: { serverlistplus: { ideas: 'slp-ideas', updates: 'slp-updates' } },
};

export default defineConfig(async () => ({
  plugins: [
    yamlAsText,
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        // Deliveries started by a request run after the test that sent it has restored fetch; they get a stand-in
        // answer here instead of a failed DNS lookup.
        outboundService: () => Response.json({ id: 'message' }),
        bindings: {
          MIGRATIONS: await readD1Migrations('./migrations'),
          GITHUB_WEBHOOK_SECRET: 'test-secret',
          DISCORD: testDiscord,
          DISCORD_BOT_TOKEN: 'bot-token',
          DISCORD_WEBHOOKS: JSON.stringify({
            announcements: 'https://discord.test/webhooks/1/announcements',
            'releases:serverlistplus': 'https://discord.test/webhooks/2/slp',
          }),
          TEST_DISCORD_PRIVATE_KEY: discordKey.privateKey.export({ format: 'der', type: 'pkcs8' }).toString('hex'),
        },
      },
    }),
  ],
  test: { setupFiles: ['./test/setup.ts'] },
}));

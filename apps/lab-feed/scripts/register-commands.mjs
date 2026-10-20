// Registers /lab on the PrexorLabs server. Run it again after a project is added to the inventory:
//   DISCORD_BOT_TOKEN=... pnpm --filter @prexorlabs/lab-feed commands
// Discord sends every use of the command to the interactions endpoint set in the Developer Portal.

import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { parse } from 'yaml';

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('DISCORD_BOT_TOKEN is not set');
  process.exit(1);
}

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
// wrangler.jsonc has comments and trailing commas; TypeScript's reader for tsconfig.json accepts both.
const { guild } = ts.parseConfigFileTextToJson('wrangler.jsonc', read('../wrangler.jsonc')).config.vars.DISCORD;
const projects = parse(read('../../../content/inventory.yaml')).filter((entry) => entry.kind === 'project');

const STRING = 3;
const SUBCOMMAND = 1;
const MANAGE_GUILD = String(1 << 5);
const post = { type: STRING, name: 'post', description: 'The post', required: true, autocomplete: true };

const lab = {
  name: 'lab',
  description: 'Write to the lab feed on prexorlabs.dev',
  default_member_permissions: MANAGE_GUILD,
  contexts: [0],
  options: [
    {
      type: SUBCOMMAND,
      name: 'post',
      description: 'Post to the site and #announcements',
      options: [
        {
          type: STRING,
          name: 'kind',
          description: 'A post, or a teaser for something not public yet',
          required: true,
          choices: [
            { name: 'Post', value: 'post' },
            { name: 'Teaser', value: 'teaser' },
          ],
        },
        {
          type: STRING,
          name: 'project',
          description: 'The project it is about',
          choices: projects.map((project) => ({
            name: project.name?.en ?? project.name ?? project.id,
            value: project.id,
          })),
        },
      ],
    },
    { type: SUBCOMMAND, name: 'edit', description: 'Change the text of a post', options: [post] },
    { type: SUBCOMMAND, name: 'delete', description: 'Remove a post from the site and Discord', options: [post] },
  ],
};

const headers = { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' };
const app = await (await fetch('https://discord.com/api/v10/applications/@me', { headers })).json();
const response = await fetch(`https://discord.com/api/v10/applications/${app.id}/guilds/${guild}/commands`, {
  method: 'PUT',
  headers,
  body: JSON.stringify([lab]),
});
if (!response.ok) {
  console.error(`Discord answered ${response.status}: ${await response.text()}`);
  process.exit(1);
}
console.log(`Registered /lab for ${app.name} on the server ${guild}.`);

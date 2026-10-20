import type { Localized } from '@prexorlabs/lab';
import * as v from 'valibot';
import { changeEvent, findEvent, record } from './events';
import type { Env } from './index';
import { NewPost, PostText } from './posts';

/** Ids on the PrexorLabs server, set in wrangler.jsonc. */
export type DiscordConfig = {
  guild: string;
  publicKey: string;
  editors: string[];
  news: string;
  projects: Record<string, { ideas: string; updates: string }>;
};

type Option = { name: string; value?: string; focused?: boolean; options?: Option[] };

type Interaction = {
  id: string;
  type: number;
  member?: { roles: string[] };
  data: {
    options?: Option[];
    custom_id?: string;
    components?: { components: { custom_id: string; value: string }[] }[];
  };
};

const InteractionType = { Ping: 1, Command: 2, Autocomplete: 4, ModalSubmit: 5 };
const Callback = { Pong: 1, Message: 4, Autocomplete: 8, Modal: 9 };
const EPHEMERAL = 1 << 6;
// Discord itself rejects interactions after a few seconds; this allows for clock drift between it and Cloudflare.
const MAX_AGE_S = 5 * 60;

const encoder = new TextEncoder();
const bytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (pair) => parseInt(pair, 16));

/** Checks Discord's Ed25519 signature over the timestamp followed by the raw body. */
async function verifyInteraction(
  publicKey: string,
  body: string,
  signature: string | null,
  timestamp: string | null,
): Promise<boolean> {
  if (!signature || !timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_AGE_S) return false;
  const key = await crypto.subtle.importKey('raw', bytes(publicKey), { name: 'Ed25519' }, false, ['verify']);
  return crypto.subtle.verify('Ed25519', key, bytes(signature), encoder.encode(timestamp + body));
}

function reply(content: string): Response {
  return Response.json({ type: Callback.Message, data: { content, flags: EPHEMERAL } });
}

type TextInput = {
  type: 4;
  custom_id: string;
  label: string;
  style: 1 | 2;
  required: boolean;
  min_length?: number;
  max_length?: number;
  value?: string;
};

function postForm(customId: string, title: string, text?: Localized): Response {
  const row = (input: TextInput) => ({ type: 1, components: [input] });
  const paragraph = (id: string, label: string, value?: string) =>
    row({ type: 4, custom_id: id, label, style: 2, required: true, min_length: 1, max_length: 500, value });
  const components = [paragraph('en', 'English', text?.en), paragraph('de', 'Deutsch', text?.de)];
  // A post's link is set once; editing changes the text only, as PATCH /v1/events/:id does.
  if (!text) components.push(row({ type: 4, custom_id: 'url', label: 'Link (optional)', style: 1, required: false }));
  return Response.json({ type: Callback.Modal, data: { custom_id: customId, title, components } });
}

async function recentPosts(db: D1Database, search: string): Promise<{ name: string; value: string }[]> {
  const { results } = await db
    .prepare(
      `SELECT id, text_en FROM events
       WHERE hidden = 0 AND kind IN ('post', 'teaser') AND text_en LIKE ?1
       ORDER BY occurred_at DESC LIMIT 25`,
    )
    .bind(`%${search}%`)
    .all<{ id: string; text_en: string }>();
  return results.map((row) => ({ name: row.text_en.slice(0, 100), value: row.id }));
}

async function runCommand(command: Option, env: Env): Promise<Response> {
  const option = (name: string) => command.options?.find((entry) => entry.name === name)?.value ?? '';
  switch (command.name) {
    case 'post':
      return postForm(`post:${option('kind')}:${option('project')}`, 'New lab post');
    case 'edit': {
      const event = await findEvent(env.LAB, option('post'));
      if (!event?.text) return reply('There is no post with this id.');
      return postForm(`edit:${event.id}`, 'Edit lab post', event.text);
    }
    case 'delete': {
      const event = await changeEvent(env.LAB, option('post'), { hidden: true });
      return reply(event ? 'Deleted from the site and from Discord.' : 'There is no post with this id.');
    }
    default:
      return reply(`Unknown command ${command.name}.`);
  }
}

async function submitForm(interaction: Interaction, env: Env): Promise<Response> {
  const values = Object.fromEntries(
    (interaction.data.components ?? []).flatMap((row) => row.components).map((input) => [input.custom_id, input.value]),
  );
  const [action, ...args] = (interaction.data.custom_id ?? '').split(':');

  if (action === 'post') {
    const [kind, project] = args;
    const post = v.safeParse(NewPost, {
      kind,
      project: project || null,
      text: { en: values.en, de: values.de },
      url: values.url || undefined,
    });
    if (!post.success) return reply(`Not posted: ${v.summarize(post.issues)}`);
    await record(env.LAB, {
      kind: post.output.kind,
      project: post.output.project ?? null,
      source: 'discord',
      occurredAt: new Date().toISOString(),
      // Discord may send the same submission again when the answer is slow; its id keeps that from posting twice.
      dedupeKey: `discord:${interaction.id}`,
      data: { url: post.output.url },
      text: post.output.text,
    });
    return reply('Posted. It shows on the site and in #announcements within a minute.');
  }

  if (action === 'edit') {
    const text = v.safeParse(PostText, { en: values.en, de: values.de });
    if (!text.success) return reply(`Not changed: ${v.summarize(text.issues)}`);
    const event = await changeEvent(env.LAB, args[0], { text: text.output });
    return reply(event ? 'Changed on the site and in Discord.' : 'There is no post with this id.');
  }

  return reply('This form is from an older version of /lab. Run the command again.');
}

export async function answerInteraction(request: Request, env: Env): Promise<Response> {
  const body = await request.text();
  const signed = await verifyInteraction(
    env.DISCORD.publicKey,
    body,
    request.headers.get('X-Signature-Ed25519'),
    request.headers.get('X-Signature-Timestamp'),
  );
  if (!signed) return new Response('Signature does not match', { status: 401 });

  const interaction: Interaction = JSON.parse(body);
  if (interaction.type === InteractionType.Ping) return Response.json({ type: Callback.Pong });

  // The command is registered for members with Manage Server only, but anyone with that permission can change who
  // sees it in the server settings. The roles are what counts.
  const editor = interaction.member?.roles.some((role) => env.DISCORD.editors.includes(role)) ?? false;
  const command = interaction.data.options?.[0];

  if (interaction.type === InteractionType.Autocomplete) {
    const search = command?.options?.find((option) => option.focused)?.value ?? '';
    const choices = editor ? await recentPosts(env.LAB, search) : [];
    return Response.json({ type: Callback.Autocomplete, data: { choices } });
  }
  if (!editor) return reply('Only Founder and Admin can use /lab.');
  if (interaction.type === InteractionType.Command && command) return runCommand(command, env);
  if (interaction.type === InteractionType.ModalSubmit) return submitForm(interaction, env);
  return new Response('Unknown interaction', { status: 400 });
}

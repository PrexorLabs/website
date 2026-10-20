import { record } from './events';
import type { Env } from './index';

type Thread = { id: string; parent_id: string; name: string; applied_tags?: string[] };
type Forum = { available_tags: { id: string; name: string }[] };

async function discordApi<T>(env: Env, path: string): Promise<T> {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
  });
  if (!response.ok) throw new Error(`Discord answered ${response.status} for ${path}`);
  return response.json<T>();
}

/** Records the ideas that moderators tagged Planned or Done in each #ideas forum. Only the title, never the author. */
export async function pollIdeas(env: Env): Promise<void> {
  const { threads: active } = await discordApi<{ threads: Thread[] }>(
    env,
    `/guilds/${env.DISCORD.guild}/threads/active`,
  );

  for (const [project, { ideas }] of Object.entries(env.DISCORD.projects)) {
    // Tags are defined by name in discord/server.yaml; their ids only exist on the server.
    const { available_tags: tags } = await discordApi<Forum>(env, `/channels/${ideas}`);
    const tagged = (thread: Thread, name: string) =>
      tags.some((tag) => tag.name === name && thread.applied_tags?.includes(tag.id));

    // Tagging a post reopens it, so new tags are found among the active threads. The archived ones are read for posts
    // tagged before the feed existed.
    const { threads: archived } = await discordApi<{ threads: Thread[] }>(
      env,
      `/channels/${ideas}/threads/archived/public?limit=100`,
    );

    for (const thread of [...active.filter((thread) => thread.parent_id === ideas), ...archived]) {
      const status = tagged(thread, 'Done') ? 'done' : tagged(thread, 'Planned') ? 'planned' : null;
      if (!status) continue;
      await record(env.LAB, {
        kind: 'idea',
        project,
        source: 'discord',
        occurredAt: new Date().toISOString(),
        dedupeKey: `idea:${thread.id}:${status}`,
        data: { title: thread.name, status },
        text: null,
      });
    }
  }
}

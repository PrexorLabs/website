import type { LabEvent, ProjectStats } from '@prexorlabs/lab';
import { labFeedUrl } from '#lib/lab.js';

export async function loadLab(fetch: typeof globalThis.fetch, limit: number) {
  const [events, projects] = await Promise.all([
    fetch(`${labFeedUrl}/v1/events?limit=${limit}`).then((response) => read<{ events: LabEvent[] }>(response)),
    fetch(`${labFeedUrl}/v1/projects`).then((response) => read<{ projects: ProjectStats[] }>(response)),
  ]);
  return { events: events.events, stats: projects.projects };
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`The lab feed answered ${response.status} for ${response.url}`);
  return response.json();
}

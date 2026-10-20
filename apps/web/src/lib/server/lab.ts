import type { LabEvent, LabEventKind, ProjectStats } from '@prexorlabs/lab';
import { labFeedUrl } from '#lib/lab.js';

export async function loadEvents(
  fetch: typeof globalThis.fetch,
  filter: { limit: number; project?: string; kind?: LabEventKind },
): Promise<LabEvent[]> {
  const query = new URLSearchParams(Object.entries(filter).map(([key, value]) => [key, String(value)]));
  return (await read<{ events: LabEvent[] }>(await fetch(`${labFeedUrl}/v1/events?${query}`))).events;
}

export async function loadStats(fetch: typeof globalThis.fetch): Promise<ProjectStats[]> {
  return (await read<{ projects: ProjectStats[] }>(await fetch(`${labFeedUrl}/v1/projects`))).projects;
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`The lab feed answered ${response.status} for ${response.url}`);
  return response.json();
}

import type { LabEvent, ProjectStats } from '@prexorlabs/lab';

// The lab feed Worker's public address, read while the pages are built. In the browser the site reaches the same
// Worker through /api/lab and the service binding in wrangler.jsonc.
const labFeedUrl = 'https://prexorlabs-lab-feed.justin-666.workers.dev';

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

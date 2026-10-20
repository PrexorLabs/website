import { loadEvents, loadStats } from '#lib/server/lab.js';

export const load = async ({ fetch }) => {
  const [events, releases, stats] = await Promise.all([
    loadEvents(fetch, { limit: 5, project: 'serverlistplus' }),
    loadEvents(fetch, { limit: 8, project: 'serverlistplus', kind: 'release' }),
    loadStats(fetch),
  ]);
  return {
    namespace: 'prexorlabs:serverlistplus',
    events,
    releases,
    stats: stats.find((entry) => entry.project === 'serverlistplus') ?? null,
  };
};

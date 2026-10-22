import { loadInventory } from '#lib/server/inventory.js';
import { loadEvents, loadStats } from '#lib/server/lab.js';
import { labPageSize } from '#lib/lab.js';

export const load = async ({ fetch }) => {
  const [events, stats] = await Promise.all([loadEvents(fetch, { limit: labPageSize }), loadStats(fetch)]);
  return {
    namespace: 'prexorlabs:lab',
    projects: Object.fromEntries(loadInventory(stats).map((item) => [item.id, item.name])),
    events,
  };
};

import { loadInventory } from '#lib/server/inventory.js';
import { loadEvents, loadStats } from '#lib/server/lab.js';

export const load = async ({ fetch }) => {
  const [events, stats] = await Promise.all([loadEvents(fetch, { limit: 6 }), loadStats(fetch)]);
  const inventory = loadInventory(stats);
  return {
    namespace: 'prexorlabs:home',
    inventory,
    projects: Object.fromEntries(inventory.map((item) => [item.id, item.name])),
    events,
  };
};

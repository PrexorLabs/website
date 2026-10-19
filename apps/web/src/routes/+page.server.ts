import { loadInventory } from '#lib/server/inventory.js';
import { loadLab } from '#lib/server/lab.js';

export const load = async ({ fetch }) => {
  const { events, stats } = await loadLab(fetch, 6);
  const inventory = loadInventory(stats);
  return {
    namespace: 'prexorlabs:home',
    inventory,
    projects: Object.fromEntries(inventory.map((item) => [item.id, item.name])),
    events,
  };
};

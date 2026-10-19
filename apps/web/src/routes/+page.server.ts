import { loadInventory } from '#lib/server/inventory.js';

export const load = () => {
  const inventory = loadInventory();
  return {
    namespace: 'prexorlabs:home',
    inventory,
    projects: Object.fromEntries(inventory.map((item) => [item.id, item.name])),
    // Filled from the lab feed once it runs (milestone M3).
    events: [],
  };
};

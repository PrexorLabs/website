import { loadInventory } from '#lib/server/inventory.js';

export const load = () => {
  const inventory = loadInventory();
  return {
    namespace: 'prexorlabs:home',
    inventory,
    projects: Object.fromEntries(inventory.map((item) => [item.id, item.name])),
    // Stays empty until the lab feed Worker exists.
    events: [],
  };
};

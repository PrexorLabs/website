import type { IconName } from '#lib/ui/icons.js';

export type ItemKind = 'project' | 'support' | 'community' | 'experiment';

/** One item in the home page inventory, already in the reader's language. */
export type InventoryItem = {
  id: string;
  namespaced: string;
  kind: ItemKind;
  icon: IconName;
  locked: boolean;
  name: string;
  lore: string;
  description: string;
  stats: { label: string; value: string }[];
  links: { label: string; href: string; primary: boolean }[];
};

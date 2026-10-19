import { parse } from 'yaml';
import source from '../../../../../content/inventory.yaml?raw';
import type { ProjectStats } from '@prexorlabs/lab';
import type { InventoryItem, ItemKind } from '#lib/inventory.js';
import type { IconName } from '#lib/ui/icons.js';
import { m } from '#lib/paraglide/messages.js';
import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';

type Localized = { en: string; de: string };

type Entry = {
  id: string;
  kind: ItemKind;
  icon?: IconName;
  locked?: boolean;
  name?: string | Localized;
  lore?: Localized;
  description?: Localized;
  status?: Localized;
  stats?: { label: Localized; value?: Localized; feed?: FeedStat }[];
  links?: { label: Localized; href: string; primary?: boolean }[];
};

/** Values the lab feed knows about a project; until a value is known its row is left out. */
type FeedStat = 'version' | 'downloads' | 'goal';

export function loadInventory(stats: ProjectStats[]): InventoryItem[] {
  const locale = getLocale();
  const numbers = new Intl.NumberFormat(locale);
  const pick = (text: string | Localized) => (typeof text === 'string' ? text : text[locale]);

  return (parse(source) as Entry[]).map((entry) => {
    if (entry.locked) {
      // Locked experiments keep their name secret until they ship, so all their text comes from the site itself.
      const number = entry.id.replace('exp-', '');
      return {
        id: entry.id,
        namespaced: 'prexorlabs:???',
        kind: entry.kind,
        icon: 'lock',
        locked: true,
        name: m.experiment_name({ number }),
        lore: m.experiment_lore({ status: entry.status ? pick(entry.status) : '' }),
        description: m.experiment_description(),
        stats: [],
        links: [{ label: m.experiment_link(), href: '/discord', primary: false }],
      };
    }
    const known = stats.find((project) => project.project === entry.id);
    const feed: Partial<Record<FeedStat, string>> = {
      version: known?.version ?? undefined,
      downloads: typeof known?.downloads === 'number' ? numbers.format(known.downloads) : undefined,
    };
    return {
      id: entry.id,
      namespaced: `prexorlabs:${entry.id}`,
      kind: entry.kind,
      icon: entry.icon ?? 'projects',
      locked: false,
      name: pick(entry.name ?? entry.id),
      lore: entry.lore ? pick(entry.lore) : '',
      description: entry.description ? pick(entry.description) : '',
      stats: (entry.stats ?? []).flatMap((stat) => {
        const value = stat.feed ? feed[stat.feed] : stat.value && pick(stat.value);
        return value ? [{ label: pick(stat.label), value }] : [];
      }),
      links: (entry.links ?? []).map((link) => ({
        label: pick(link.label),
        // Pages end in a slash and get the language prefix; short links like /discord are redirects for everyone.
        href: link.href.endsWith('/') ? localizeHref(link.href) : link.href,
        primary: link.primary ?? false,
      })),
    };
  });
}

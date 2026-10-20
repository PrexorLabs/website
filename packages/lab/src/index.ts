// What the lab feed stores and serves. An event records what happened, not a sentence: `describe` turns it into text
// in the reader's language, the same way on the site and in the feeds. Only posts written by people carry their own.

export type LabEventKind = 'release' | 'post' | 'teaser' | 'idea' | 'goal' | 'unlocked';

export type LabEventSource = 'modrinth' | 'curseforge' | 'github' | 'discord' | 'kofi' | 'api';

export type Locale = 'en' | 'de';

export type Localized = Record<Locale, string>;

export type Platform = 'modrinth' | 'curseforge' | 'github';

export type LabEvent = {
  id: string;
  kind: LabEventKind;
  project: string | null;
  source: LabEventSource;
  occurredAt: string;
  data: {
    version?: string;
    gameVersions?: string[];
    platform?: Platform;
    title?: string;
    status?: 'planned' | 'done';
    goal?: string;
    url?: string;
  };
  text: Localized | null;
};

/** What the lab feed sends to open pages when an event is new or changed, or when it was removed. */
export type LabLiveMessage = { event: LabEvent } | { hidden: string };

/** What the feed knows about a project, for the item's details on the home page. */
export type ProjectStats = {
  project: string;
  version: string | null;
  gameVersions: string[];
  downloads: number | null;
  updatedAt: string;
};

const platformNames: Record<Platform, string> = { modrinth: 'Modrinth', curseforge: 'CurseForge', github: 'GitHub' };

const sentences = {
  en: {
    release: (project: string, version: string, platform: string) => `${project} ${version} is out on ${platform}.`,
    idea: (title: string, done: boolean) => `${done ? 'Done' : 'Planned'}: ${title}`,
    goal: (goal: string) => `Donation goal reached: ${goal}. Thank you.`,
    unlocked: (project: string) => `New in the inventory: ${project}.`,
  },
  de: {
    release: (project: string, version: string, platform: string) =>
      `${project} ${version} ist auf ${platform} erschienen.`,
    idea: (title: string, done: boolean) => `${done ? 'Erledigt' : 'Geplant'}: ${title}`,
    goal: (goal: string) => `Spendenziel erreicht: ${goal}. Danke.`,
    unlocked: (project: string) => `Neu im Inventar: ${project}.`,
  },
};

export function describe(event: LabEvent, locale: Locale, projectName: string): string {
  const say = sentences[locale];
  switch (event.kind) {
    case 'release':
      return say.release(projectName, event.data.version ?? '', platformNames[event.data.platform ?? 'modrinth']);
    case 'idea':
      return say.idea(event.data.title ?? '', event.data.status === 'done');
    case 'goal':
      return say.goal(event.data.goal ?? '');
    case 'unlocked':
      return say.unlocked(projectName);
    case 'post':
    case 'teaser':
      return event.text?.[locale] ?? '';
  }
}

// What the lab feed stores and serves. An event records what happened, not a sentence: the site turns it into text in
// the reader's language, so only posts written by people carry text of their own.

export type LabEventKind = 'release' | 'post' | 'teaser' | 'idea' | 'goal' | 'unlocked';

export type LabEventSource = 'modrinth' | 'curseforge' | 'github' | 'discord' | 'kofi';

export type Localized = { en: string; de: string };

export type LabEvent = {
  id: string;
  kind: LabEventKind;
  project: string | null;
  source: LabEventSource;
  occurredAt: string;
  data: {
    version?: string;
    gameVersions?: string[];
    platform?: 'modrinth' | 'curseforge' | 'github';
    title?: string;
    goal?: string;
    url?: string;
  };
  text: Localized | null;
};

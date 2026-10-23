import { getLocale } from '#lib/paraglide/runtime.js';

const repository = 'https://github.com/PrexorLabs/ServerListPlus';

/** The one released project. Facts change with each release; the texts about it live in the message files. */
export const serverListPlus = {
  number: '001',
  name: 'ServerListPlus',
  path: '/projects/serverlistplus/',
  version: '1.2.0',
  released: '2026-10-13',
  updated: '2026-10-18',
  minecraft: { from: '1.20.5', to: '26.3' },
  repository,
  releases: `${repository}/releases`,
  download: `${repository}/releases/latest`,
  icon: '/images/serverlistplus/icon.avif',
  screenshot: '/images/serverlistplus/server-list.avif',
};

/** The experiment after it, which has no name yet. */
export const nextExperiment = { number: '002' };

/** A date from the project facts in the reader's language: 13 October 2026, 13. Oktober 2026. */
export function formatDate(date: string) {
  // British order for English, so the day comes first in both languages.
  const locale = getLocale() === 'de' ? 'de-DE' : 'en-GB';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));
}

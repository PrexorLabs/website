import { describe, type LabEvent, type Locale } from '@prexorlabs/lab';
import { projectName } from './projects';

const titles: Record<Locale, string> = { en: 'Latest from the lab', de: 'Neues aus dem Labor' };

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function labPage(site: string, locale: Locale): string {
  return locale === 'de' ? `${site}/de/lab/` : `${site}/lab/`;
}

export function atomFeed(events: LabEvent[], locale: Locale, site: string): string {
  const updated = events[0]?.occurredAt ?? new Date(0).toISOString();
  const entries = events.map((event) => {
    const title = escapeXml(describe(event, locale, projectName(event.project)));
    const link = escapeXml(event.data.url ?? labPage(site, locale));
    return `  <entry>
    <id>urn:prexorlabs:lab:${event.id}</id>
    <title>${title}</title>
    <link href="${link}"/>
    <updated>${event.occurredAt}</updated>
  </entry>`;
  });
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">
  <id>${site}/lab.xml?lang=${locale}</id>
  <title>PrexorLabs · ${titles[locale]}</title>
  <link href="${labPage(site, locale)}"/>
  <link rel="self" href="${site}/lab.xml?lang=${locale}"/>
  <updated>${updated}</updated>
  <author><name>PrexorLabs</name></author>
${entries.join('\n')}
</feed>
`;
}

export function jsonFeed(events: LabEvent[], locale: Locale, site: string): object {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: `PrexorLabs · ${titles[locale]}`,
    home_page_url: labPage(site, locale),
    feed_url: `${site}/lab.json?lang=${locale}`,
    language: locale,
    items: events.map((event) => ({
      id: event.id,
      url: event.data.url ?? labPage(site, locale),
      content_text: describe(event, locale, projectName(event.project)),
      date_published: event.occurredAt,
    })),
  };
}

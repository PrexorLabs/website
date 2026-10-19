import { parse } from 'yaml';
import inventory from '../../../content/inventory.yaml';

export type Project = { id: string; name: string; modrinth?: string; github?: string };

type Entry = { id: string; kind: string; name?: string | { en: string }; modrinth?: string; github?: string };

// The site's inventory is the one list of projects; the feed reads where each one publishes its releases from it.
export const projects: Project[] = (parse(inventory) as Entry[])
  .filter((entry) => entry.kind === 'project')
  .map((entry) => ({
    id: entry.id,
    name: typeof entry.name === 'object' ? entry.name.en : (entry.name ?? entry.id),
    modrinth: entry.modrinth,
    github: entry.github,
  }));

export function projectName(id: string | null): string {
  return projects.find((project) => project.id === id)?.name ?? id ?? '';
}

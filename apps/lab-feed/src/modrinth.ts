import { normalizeVersion, recordRelease, saveStats } from './events';
import { projects } from './projects';

const api = 'https://api.modrinth.com/v2';
// Modrinth asks every client to identify itself with a contact.
const headers = { 'User-Agent': 'PrexorLabs/lab-feed (contact@prexorlabs.dev)' };

type ModrinthProject = { downloads: number };
type ModrinthVersion = { id: string; version_number: string; game_versions: string[]; date_published: string };

/** Records releases that are new on Modrinth and refreshes each project's version and downloads. */
export async function pollModrinth(db: D1Database): Promise<void> {
  for (const project of projects) {
    if (!project.modrinth) continue;

    const projectResponse = await fetch(`${api}/project/${project.modrinth}`, { headers });
    // A project in review or unlisted is not public yet, so there is nothing to report until it is.
    if (projectResponse.status === 404) continue;
    if (!projectResponse.ok) throw new Error(`Modrinth answered ${projectResponse.status} for ${project.modrinth}`);
    const { downloads } = await projectResponse.json<ModrinthProject>();

    const versionsResponse = await fetch(`${api}/project/${project.modrinth}/version`, { headers });
    if (!versionsResponse.ok) {
      throw new Error(`Modrinth answered ${versionsResponse.status} for the versions of ${project.modrinth}`);
    }
    const versions = await versionsResponse.json<ModrinthVersion[]>();

    await saveStats(db, {
      project: project.id,
      version: versions[0] ? normalizeVersion(versions[0].version_number) : null,
      gameVersions: versions[0]?.game_versions ?? [],
      downloads,
    });

    // Oldest first, so a release published on several loaders keeps the date of its first upload.
    for (const version of versions.toReversed()) {
      await recordRelease(db, {
        project: project.id,
        version: version.version_number,
        platform: 'modrinth',
        source: 'modrinth',
        url: `https://modrinth.com/mod/${project.modrinth}/version/${version.id}`,
        occurredAt: version.date_published,
        gameVersions: version.game_versions,
      });
    }
  }
}

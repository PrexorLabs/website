import type { LabEvent } from '@prexorlabs/lab';

// The lab feed Worker's own address. Pages read the feed from it while they are built, and the browser listens to it
// for live changes; other reads in the browser go through /api/lab and the service binding in wrangler.jsonc.
export const labFeedUrl = 'https://prexorlabs-lab-feed.justin-666.workers.dev';

/** Who an event reads as coming from in the lab chat, like the sender of a Minecraft chat line. */
export function senderOf(event: LabEvent): { name: string; tone: 'release' | 'community' | 'lab' } {
  if (event.kind === 'release') return { name: 'PrexorLabs', tone: 'release' };
  if (event.kind === 'idea') return { name: 'Ideas', tone: 'community' };
  if (event.kind === 'goal') return { name: 'Donate', tone: 'community' };
  return { name: 'Lab', tone: 'lab' };
}

/** How many entries the lab page shows at first and adds with every "Older entries". */
export const labPageSize = 30;

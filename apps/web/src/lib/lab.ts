// The lab feed Worker's own address. Pages read the feed from it while they are built, and the browser listens to it
// for live changes; other reads in the browser go through /api/lab and the service binding in wrangler.jsonc.
export const labFeedUrl = 'https://prexorlabs-lab-feed.justin-666.workers.dev';

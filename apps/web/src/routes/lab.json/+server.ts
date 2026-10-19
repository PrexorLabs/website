import { env } from 'cloudflare:workers';

// The lab feed as JSON Feed, at the address the footer links to; ?lang=de gives the German one.
export const prerender = false;

export const GET = ({ url }) => env.LAB_FEED.fetch(`https://lab-feed/v1/feed.json${url.search}`);

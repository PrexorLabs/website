import { env } from 'cloudflare:workers';

// Read access to the lab feed for the browser, through the service binding to the lab feed Worker.
export const prerender = false;

export const GET = ({ params, url }) => env.LAB_FEED.fetch(`https://lab-feed/${params.path}${url.search}`);

// The bindings from wrangler.jsonc, as the adapter hands them to server routes through cloudflare:workers.
declare module 'cloudflare:workers' {
  export const env: {
    /** Service binding to the lab feed Worker. */
    LAB_FEED: { fetch(input: string): Promise<Response> };
  };
}

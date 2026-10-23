import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      // The language lives in the path (English at /, German at /de/), so every page can be prerendered once per
      // language and a shared link always opens in the language it was shared in.
      strategy: ['url', 'baseLocale'],
    }),
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
      },
      adapter: adapter(),
      // All CSS together is about 12 KB before compression; written into the page it costs no extra round trip
      // before the first paint, which on a slow phone connection is most of the wait.
      inlineStyleThreshold: 32768,
      // The Worker answers any unknown address with 404.html, so its links to scripts and fonts must not depend on
      // the folder the address points into.
      paths: { relative: false },
      prerender: {
        // No page links to the 404 pages, so the crawler would never find them.
        entries: ['*', '/404', '/de/404'],
        // The short links are answered by _redirects, not by a page here.
        handleHttpError: ({ path, message }) => {
          if (['/discord', '/github'].includes(path)) return;
          throw new Error(message);
        },
      },
    }),
  ],
});

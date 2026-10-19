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
      // All CSS together is about 20 KB before compression; written into the page it costs no extra round trip
      // before the first paint, which on a slow phone connection is most of the wait.
      inlineStyleThreshold: 32768,
      prerender: {
        // Short links and feeds are answered by static/_redirects and the lab feed Worker, not by a page here.
        handleHttpError: ({ path, message }) => {
          if (['/discord', '/github', '/modrinth', '/lab.xml', '/lab.json'].includes(path)) return;
          throw new Error(message);
        },
      },
    }),
  ],
});

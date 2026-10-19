import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  { ignores: ['.svelte-kit/', '.wrangler/', 'src/lib/paraglide/'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  {
    rules: {
      // Links go through Paraglide's localizeHref, which already returns the final path with the /de prefix;
      // resolve() only knows the route ids without it.
      'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true }],
    },
  },
);

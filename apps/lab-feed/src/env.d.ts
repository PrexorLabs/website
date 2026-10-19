// wrangler bundles YAML files as text (see `rules` in wrangler.jsonc), and so does vitest.config.ts.
declare module '*.yaml' {
  const text: string;
  export default text;
}

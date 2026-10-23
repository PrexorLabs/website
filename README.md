# prexorlabs.dev

The website of PrexorLabs: a start page, a page listing the projects and one page per project, the imprint and the
privacy page, in English and German, with a light and a dark theme. Decisions are recorded in [docs/adr](docs/adr).

## Layout

| Path                  | What                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `apps/web/`           | the site: SvelteKit, prerendered and served by a Cloudflare Worker; texts in `messages/` |
| `apps/web/src/lib/`   | header, hotbar, footer, the drawings, the theme and the fonts                            |
| `apps/web/static/`    | favicon and project images                                                               |
| `apps/web/_redirects` | the short links `/discord` and `/github`                                                 |
| `docs/adr/`           | architecture decision records                                                            |

## Requirements

- Node.js 24 or newer and pnpm (version pinned in `package.json`)
- A Cloudflare account with access to `prexorlabs.dev`, only for deploying (`pnpm --filter @prexorlabs/web exec wrangler login`)

## Working on it

```sh
pnpm install
just dev      # the site with hot reload on http://localhost:5173
just preview  # the built site in the local Workers runtime
just check    # everything CI checks
just format   # format all code
```

The fonts are cut to what the site uses by `pnpm --filter @prexorlabs/web fonts`; run it after adding a weight or a
character outside the ranges in `apps/web/scripts/subset-fonts.mjs`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how code here is written.

# prexorlabs.dev

The website of PrexorLabs: a home page laid out like a Minecraft inventory, a page per project, the donate page and a
feed of releases and announcements from the lab. Decisions are recorded in [docs/adr](docs/adr).

## Layout

| Path               | What                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `apps/web/`        | the site: SvelteKit, prerendered and served by a Cloudflare Worker; texts in `messages/` |
| `apps/lab-feed/`   | the Worker that collects releases and posts into D1 and serves them as JSON and feeds    |
| `packages/lab/`    | the event types and the sentences for them, shared by the site and the feed              |
| `content/`         | `inventory.yaml`: the items on the home page and where each project publishes releases   |
| `packages/tokens/` | colors and sizes as CSS variables, a copy of the Prexor design tokens (`tokens.json`)    |
| `docs/adr/`        | architecture decision records                                                            |

## Requirements

- Node.js 24 or newer and pnpm (version pinned in `package.json`)
- A Cloudflare account with access to `prexorlabs.dev`, only for deploying (`pnpm --filter @prexorlabs/web exec wrangler login`)

## Working on it

```sh
pnpm install
just dev      # the site with hot reload on http://localhost:5173
just preview  # the built site in the local Workers runtime
just feed     # the lab feed Worker with a local database
just check    # everything CI checks
just format   # format all code
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how code here is written.

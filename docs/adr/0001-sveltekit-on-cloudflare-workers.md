# 0001. SvelteKit on Cloudflare Workers

Status: Accepted, 2026-10-19

## Context

PrexorLabs needs a website at `prexorlabs.dev`: a home page for the organisation, a page per project (ServerListPlus
first), a donate page that GitHub, Modrinth and CurseForge can link to, and the legal pages German law requires. It is
mostly text and pictures, so the first load has to be fast, and moving between pages should feel like an app, without
a full reload. A feed of releases and announcements is collected by a separate Worker. The site does not depend on the
Prexor client, whose release is open.

## Decision

The website is its own repository, `PrexorLabs/website`. It uses Svelte 5, SvelteKit with `adapter-cloudflare`, Vite,
TypeScript and Paraglide, with English under `/` and German under `/de/`. Every page is prerendered to HTML at build
time and served as a static asset of a Cloudflare Worker; client-side rendering stays on, so after the first load the
SvelteKit router swaps pages in place, preloads them on hover and animates between them with the View Transitions API.
URLs end in a slash, because Paraglide writes localized links that way.

Colors and sizes come from a copy of the Prexor design tokens as CSS custom properties; styles are plain CSS. Geist is
served from the site itself. The site sets no cookies and loads nothing from other servers.

Cloudflare Workers with static assets replaces Cloudflare Pages, which Cloudflare no longer recommends for new
projects; the feed Worker, its D1 database and cron triggers live in the same account on the free plan. The donate page
lives at `/donate`; `donate.prexorlabs.dev` and the short links `/discord`, `/github` and `/modrinth` are redirects.

## Consequences

Pages ship the router and hydration code, about 30 KB of compressed JavaScript; CI fails a pull request when a page
grows past 100 KB on first load including fonts. Without JavaScript every page still works as plain HTML.

## Rejected

Nuxt and Astro, which would add a second framework next to the launcher's; rendering without client-side JavaScript
(`csr = false`), which saves the 30 KB but reloads the whole page on every link; a Rust or WebAssembly frontend;
Tailwind, a second source for colors and sizes next to the tokens; Vercel, whose free plan excludes commercial use and
which would split the site from the feed Worker; a folder in the Prexor repository, which would tie the site to a
product that may not be released.

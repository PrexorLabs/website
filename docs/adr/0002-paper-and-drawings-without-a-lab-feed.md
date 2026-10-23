# 0002. Paper and drawings, without a lab feed

Status: Accepted, 2026-10-23. Replaces the parts of 0001 about the feed Worker, the design tokens and Geist.

## Context

The first version of the site was laid out like a Minecraft inventory, took its colours from the Prexor design tokens
and showed releases, posts and Discord ideas from a separate feed Worker with a D1 database. It read as made by an AI
tool and as a game menu rather than a lab, and the feed added a database, a Discord bot and a Durable Object for a site
with one released project.

## Decision

The site starts over with one page, the legal pages and a 404 page. The look is paper by day and warm black by night:
Fraunces for headlines, Instrument Sans for text, and a set of the lab's own drawings on the 16 × 16 grid of the
hotbar icons, coloured with the blue and orange of the ServerListPlus icon. The theme follows the system until someone
picks one with the button in the header; the choice stays in the browser's local storage. The hotbar stays as the main
menu, with number keys as shortcuts.

The start page shows the projects as a fan of cards: the newest released project in the middle, the one being built
on one side and an invitation to #ideas on the other.

The feed Worker, its database and the Discord integration are removed from the repository; `apps/web` has no bindings.
Versions and project facts are written into the page until a second project makes a shared source worth it.

## Consequences

The start page needs 200 KB instead of 100 KB because it shows three screenshots in turn; every other page keeps the
100 KB budget. Releases no longer appear on the site or in Discord on their own. The Worker `prexorlabs-lab-feed` and
its D1 database still exist in the Cloudflare account until they are deleted there.

# 0002. A Worker collects the lab feed

Status: Accepted, 2026-10-19

## Context

The home page shows the latest from the lab: releases, announcements, ideas. Writing those by hand means the site
falls behind as soon as someone forgets, and the same news would have to be written again for Discord and for feed
readers. Releases already happen on Modrinth and GitHub, where they can be read automatically.

## Decision

A separate Cloudflare Worker, `apps/lab-feed`, collects events into a D1 database and serves them as JSON, Atom and
JSON Feed. GitHub sends releases by a signed webhook; Modrinth has no webhooks, so the Worker asks its API every ten
minutes. Which repository and Modrinth project belong to which item comes from `content/inventory.yaml`, the same file
the inventory on the home page is built from.

An event stores what happened (project, version, platform, link), not a sentence. `packages/lab` turns it into text
in English or German, used by both the feed and the site; only posts written by people carry their own text in both
languages. A release that arrives from several platforms, or once per mod loader, is one event: versions are compared
without a leading `v`, build metadata and a loader suffix, and the first platform to report it wins.

Writing goes through an API with bearer tokens and scopes, so the Discord bot can post later without a change here.
The schema is plain SQL migrations applied by wrangler. The site reads the feed while it is built and refreshes it in
the browser through a service binding at `/api/lab`, which only allows reading.

## Consequences

The feed works without anyone maintaining it, and every channel shows the same events. Releases published before the
webhook existed were added once by hand. A project that is not public on Modrinth yet is skipped until it is.

## Rejected

Rebuilding the site every hour to pull releases, which delays news by up to an hour and does not reach Discord;
Drizzle for four small tables; a separate event per platform, which would announce every release three times.

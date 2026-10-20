# 0004. Live updates through a Durable Object

Status: Accepted, 2026-10-20

## Context

A post written with `/lab post` should show up on an open home page without a reload. The Worker that stores the
event and the request of the page that shows it run in different isolates, so something has to hold the open
connections and receive the change.

## Decision

One Durable Object, `LabLive` under the name `lab`, accepts a WebSocket from every open home page at `/v1/live` and
sends each message to all of them. It uses the hibernation API: the sockets stay open while the object sleeps, and
pages only listen, so an idle page costs nothing.

The site is one more outbox target next to the Discord channels. Every event gets a `site` row, and a change or
removal marks it unsynced again, so the page learns about it the same way Discord does, with the same retries. A
message carries the whole event, or `{ hidden: id }` for one that was removed; the page puts it in place without
asking the feed again. After a dropped connection the page reconnects after 15 s and fetches the list once for what
it missed.

The browser connects to the lab feed's own address. Passing the WebSocket through `/api/lab` would need SvelteKit to
hand over a `101` response untouched, which it does not promise.

## Consequences

Events found by a cron (Modrinth releases, ideas) reach open pages within a minute; posts and webhooks right away.
Each page opens one connection, which counts as one Durable Object request on the free plan.

## Rejected

Polling every minute, which is not live and asks the feed even when nothing changed; Server-Sent Events from the
Worker, which still needs a Durable Object to learn about the change and keeps a request running per page.

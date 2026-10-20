# 0003. Discord through an interactions endpoint and webhooks

Status: Accepted, 2026-10-20

## Context

News is written once and should show up on the site, in the feeds and on Discord. The team writes on Discord anyway,
so that is where posts start. The lab feed runs as a Worker, which cannot hold the gateway connection a classic bot
needs.

## Decision

The application "Prexor" sends `/lab` to `POST /discord/interactions` on the lab feed. The Worker checks Discord's
Ed25519 signature and the member's roles (Founder or Admin, ids in `wrangler.jsonc`), and answers `/lab post` with a
form for the English and German text.

Messages go out through channel webhooks, which `discord/server.yaml` defines. Every new event that belongs in a
channel gets a row in an outbox table in the same batch that stores it. The Worker delivers right after the request
and every minute, edits or deletes the message when the event changes, and retries failures with a pause that doubles
up to ten times. A row is leased before it is sent, so the cron and a request never post the same message twice.
Releases older than two days are not announced, so a project going public with its history does not flood a channel.

Ideas are read with the bot token every hour from each project's #ideas forum: posts tagged Planned or Done become
events with the title only.

## Consequences

Discord allows either an interactions endpoint or gateway commands per application. When PrexorBot runs on the
gateway, it takes over `/lab` and writes through `POST /v1/events`; the endpoint here is then switched off.
Edits through the API change the Discord message too, since both go through the outbox.

## Rejected

Posting to Discord from the request itself without an outbox, which loses a message whenever Discord is slow;
the bot API for sending, which would need the bot in every channel and gives nothing webhooks lack; a modal select for
the project, which Discord only offers in newer components, where a command option does the same.

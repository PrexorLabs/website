# Changelog

All notable changes to the lab feed Worker are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Events in D1, listed newest first at `/v1/events`, with project stats at `/v1/projects`.
- Releases from GitHub through a signed webhook and from Modrinth every ten minutes, one event per version.
- Atom and JSON Feed in English and German.
- Posts written through the API with bearer tokens and scopes; `pnpm token` creates one.
- `/lab post`, `/lab edit` and `/lab delete` on Discord for Founder and Admin, through a signed interactions endpoint;
  `pnpm commands` registers them.
- Posts, announcements and new releases go to #announcements and the project's releases channel through webhooks;
  edits and deletions follow, failures are retried with a growing pause.
- Ideas tagged Planned or Done in a project's #ideas forum, read every hour.

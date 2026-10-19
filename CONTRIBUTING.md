# Contributing

Code here should read as if a careful, experienced developer who knows the project wrote it. The rules below are the
same as in the Prexor repository; each one replaces a pattern that hurried code tends to show.

## Style rules

| Avoid                                                                                                     | Do instead                                                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Comments that narrate the code (`// Fetch the events`)                                                    | Comment only the why: a workaround, a quirk of a foreign API, an assumption that is not obvious. No commented-out code        |
| Catch-all names: `Manager`, `Helper`, `Utils`, `Service`, `data`, `handleX`                               | Names from the domain: `InventorySlot`, `LabEvent`, `Hotbar`, `DonationGoal`                                                  |
| Abstraction in advance: an interface with one implementation, a store for one value, options nobody needs | Abstract at the second real use case                                                                                          |
| `try`/`catch` with log-and-continue everywhere, checks for impossible states                              | Handle an error where something can be done about it, otherwise pass it on with context. Do not check what the type rules out |
| Many tiny components and helpers that are each used once                                                  | Components as large as the piece of the page they draw; split when a part is reused or has its own state                      |
| Text in markup                                                                                            | Every visible text in `apps/web/messages/en.json` and `de.json`, written in both languages in the same change                 |
| Emoji, exclamation marks, marketing words ("robust", "seamless", "powerful") in texts and docs            | Plain: what it is and what the reader can do                                                                                  |
| Long commit messages with bullet lists                                                                    | One commit does one thing; one line, English, imperative                                                                      |
| Tests for getters, names like `test1`                                                                     | Tests check behaviour and the name says which: `ignores a GitHub delivery it has seen`                                        |

## Accessibility and motion

Slots, items and hotbar entries are real buttons and links, every page works with the keyboard alone, and text keeps a
contrast of at least 4.5 : 1. Every animation stops under `prefers-reduced-motion: reduce`. The site has to work as
plain HTML before JavaScript loads.

## Tools

Formatting is never up for discussion; CI rejects unformatted code. `just format` fixes it.

| Language           | Formatter | Linter               |
| ------------------ | --------- | -------------------- |
| TypeScript, Svelte | Prettier  | ESLint, svelte-check |

## Workflow

- `main` deploys to production. Work happens on short feature branches and pull requests, also when working alone, so
  CI runs before the merge.
- `just check` runs everything CI checks.
- Every larger decision gets an ADR in `docs/adr/`. An accepted ADR is never rewritten; a new one replaces it.
- `apps/web/CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
- Code, comments and commits are in English. Visible text is in English and German.

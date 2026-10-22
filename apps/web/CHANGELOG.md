# Changelog

All notable changes to prexorlabs.dev are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Start page laid out as a Minecraft inventory: items with tooltips, an inspector for the chosen item (a sheet on
  phones), a crafting recipe with donations as the middle ingredient and the latest entries from the lab.
- The hotbar as main menu, floating at the bottom of the screen like in the game, with number keys 1 to 6 as
  shortcuts and a tab bar on phones.
- Inventory items are kept in `content/inventory.yaml`; locked experiments show without a name.
- Placeholder pages for the projects, lab, donate and legal pages.
- Short links `/discord`, `/github` and `/modrinth`.
- Geist and Geist Mono cut to the characters and weights in use (51 KB to 31 KB).
- Lighthouse check in CI with a budget of 100 KB per page.
- The lab chat shows real entries from the lab feed and refreshes them in the browser; `/lab.xml` and `/lab.json`
  serve the feed in English or German (`?lang=de`).
- ServerListPlus page: features, facts and versions from the lab feed, screenshots, the project's lab entries and a
  donation call. The download button goes to GitHub until Modrinth has approved the mod.
- The lab chat updates while the page is open: new entries appear with a short highlight, edits and deletions show
  right away.
- Lab page with every entry of the lab feed by month, filters for releases, posts, ideas and goals, older entries
  on demand and links to the Atom and JSON feeds.

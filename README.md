# Path of Exile starter builds

A collection of [Path of Exile](https://www.pathofexile.com/) character-build guides selected by Razunter for the start of a new league.

**[Browse the builds](https://raz-poebuilds.netlify.app/)**

## What you’ll find

- Builds grouped by playstyle, including melee, ranged, spellcasters, and minions.
- Video previews where available, with links to the creators’ guides.
- Collections from past leagues, going back to version 3.14.

This is a curated selection of guides from different creators, rather than a complete list of every possible build.

## About this repository

This repository contains the website’s source code. The site is built with [Astro](https://astro.build) and hosted on Netlify.

The tool used to edit the collection lives in a separate repository: [poe-app](https://github.com/Razunter/poe-app).

## Checks

Run `bun test tests/filterVersionData.test.ts tests/youtubePlayback.test.ts` to check league compatibility, skipped builds, empty categories, and delayed YouTube playback.
Run `bun --bun run build` to build current and archived pages.
When changing video handling, check mouse and keyboard activation in the browser. Starting a YouTube preview must send pause commands to other previews.

Bun applies `patches/lite-youtube-embed@0.3.4.patch` during installation. The patch shares API readiness across previews and exposes pending player promises without upgrading the dependency.

## License

Licensed under the [MIT License](LICENSE).

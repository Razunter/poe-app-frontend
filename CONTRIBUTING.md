# Contributing

## Checks

Run `bun test tests/filterVersionData.test.ts tests/youtubePlayback.test.ts` to check league compatibility, skipped builds, empty categories, and delayed YouTube playback.
Run `bun --bun run build` to build current and archived pages.
After a fresh production build, run `bun test tests/posterLoading.test.ts` to check poster sources, category order, and image loading priorities on every league page. The suite reads `dist` and does not rebuild it.
After a fresh production build, run `bun test tests/sectionTitles.test.ts` to check current and archived section titles, navigation, icons, category order, and filtered build membership. This suite also reads `dist` without rebuilding it.
When changing video handling, check mouse and keyboard activation in the browser. Starting a YouTube preview must send pause commands to other previews.

## Site metadata

`src/layouts/Layout.astro` shares league-specific titles and descriptions across HTML, Open Graph, Twitter cards and CollectionPage JSON-LD. WebSite JSON-LD describes the site as a whole.

`public/site-preview.jpg` is the generated evergreen preview, shared by social cards and JSON-LD. Keep its 1200 × 630 dimensions and the image description in `src/data/metadata.json` in sync when replacing it.

Canonical and image URLs use `site` from `astro.config.ts`. Archive canonicals include a trailing slash because Netlify redirects `/old-{version}.html` to `/old-{version}.html/`. Check the homepage and an archive after changing URL configuration.

## Video maintenance

Bun applies `patches/lite-youtube-embed@0.3.4.patch` during installation. The patch shares API readiness across previews and exposes pending player promises without upgrading the dependency.

Video posters use native responsive images. Only the first thumbnail in rendered category order uses `loading="eager"` and `fetchpriority="high"`; all later posters use `loading="lazy"`. Categories without thumbnails do not consume priority.

YouTube poster candidates stop at 640px to preserve the dependency's previous resolution ceiling and avoid unnecessary mobile `maxres` downloads. Twitch keeps all available sizes.

Keep inline `background-image: none` on each `lite-youtube` host. Its nonempty inline value prevents the dependency from loading a second JPEG background and probing a WebP poster. The native image uses the collection's WebP sources instead. Playback and API-readiness handling still use the patched embed.

## Stable collection entry IDs

Collection entries require persisted UUIDv4 `id` values, unique across categories within each collection. Static generation rejects missing, malformed or colliding IDs before filtering. IDs may recur across releases. Historical URL and video duplicates remain publishable. No visitor requests, routes or deployment settings change.

Stop the old editor before migrating. It discards unknown ID fields on save. Keep both applications stopped while replacing collection files, and run only one migration process at a time.

First prove the command on disposable copies:

```sh
bun test tests/migrateBuildIds.test.ts tests/collectionIdentity.test.ts tests/filterVersionData.test.ts
copy=$(mktemp -d)
cp src/data/data-*.json "$copy/"
bun scripts/migrateBuildIds.ts --dir "$copy"
bun scripts/migrateBuildIds.ts --dir "$copy" --write
bun scripts/migrateBuildIds.ts --dir "$copy"
```

After reviewing that evidence, preview and explicitly write the real files:

```sh
bun scripts/migrateBuildIds.ts
bun scripts/migrateBuildIds.ts --write
bun scripts/migrateBuildIds.ts
```

Dry-run is the default and creates no files. The report lists changed files and historical shared-video groups without rejecting those groups. It recognizes standard watch, short-link, Shorts, live and embed URLs. It never fetches metadata or infers identity from videos.

The planner reads every `data-*.json` in the directory before writing. Exact guide URLs share one UUID across files by default. Different URLs without existing IDs or reviewed mappings receive distinct IDs. Existing valid IDs are retained; contradictory assignments fail rather than being regenerated. JSON property and array order and all non-ID values, including unknown fields, are retained. Changed files are formatted with two-space indentation.

For reviewed historical URL changes or URL reuse, pass `--mapping /absolute/path/reviewed-ids.json`. Its shape is a filename-to-guide-URL-to-UUID object:

```json
{
  "data-3-29.json": { "https://example.com/old-guide": "00000000-0000-4000-8000-000000000001" },
  "data-3-30.json": { "https://example.com/new-guide": "00000000-0000-4000-8000-000000000001" }
}
```

Existing IDs establish continuity even when guide URLs differ. Map missing-ID entries to those IDs when a reviewed URL change establishes continuity. A per-file URL override can separate a reused URL from its default historical identity. Mapping keys must name real files and URLs. Mappings cannot replace existing IDs. Keep the mapping for repeatable offline review; it is not a runtime identity registry.

Before replacement, `.identity-migration/originals/` receives the original bytes of every collection. `.identity-migration/plan.json` records every planned output and assignment. All changed outputs are staged before any rename into place. Interrupted publication resumes from that plan, including IDs not yet published. Do not remove this directory during recovery. A rerun refuses collections edited after planning, rather than overwriting them. After completion and review, archive the entire backup directory outside `src/data` before a later independent migration.

To restore, stop both applications and copy the originals over their matching files:

```sh
cp src/data/.identity-migration/originals/data-*.json src/data/
```

Archive the plan outside `src/data` after restoration if abandoning the migration. Keeping it allows the same assignments to be reapplied. Backups and staged files are ignored by Git. The directory is recoverable, not an atomic multi-file filesystem transaction; keep the editor stopped until all files are published or restored.

Then run the production build and existing archive-output tests listed above. Saving editor JSON and migrating local collections do not deploy or publish the website.

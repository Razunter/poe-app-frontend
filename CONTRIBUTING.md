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

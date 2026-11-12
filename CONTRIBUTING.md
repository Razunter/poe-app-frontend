# Contributing

## Checks

Run `bun test tests/filterVersionData.test.ts tests/youtubePlayback.test.ts` to check league compatibility, skipped builds, empty categories, and delayed YouTube playback.
Run `bun --bun run build` to build current and archived pages.
After a fresh production build, run `bun test tests/posterLoading.test.ts` to check poster sources, category order, and image loading priorities on every league page. The suite reads `dist` and does not rebuild it.
After a fresh production build, run `bun test tests/sectionTitles.test.ts` to check current and archived section titles, navigation, icons, category order, and filtered build membership. This suite also reads `dist` without rebuilding it.
When changing video handling, check mouse and keyboard activation in the browser. Starting a YouTube preview must send pause commands to other previews.

## Video maintenance

Bun applies `patches/lite-youtube-embed@0.3.4.patch` during installation. The patch shares API readiness across previews and exposes pending player promises without upgrading the dependency.

Video posters use native responsive images. Only the first thumbnail in rendered category order uses `loading="eager"` and `fetchpriority="high"`; all later posters use `loading="lazy"`. Categories without thumbnails do not consume priority.

YouTube poster candidates stop at 640px to preserve the dependency's previous resolution ceiling and avoid unnecessary mobile `maxres` downloads. Twitch keeps all available sizes.

Keep inline `background-image: none` on each `lite-youtube` host. Its nonempty inline value prevents the dependency from loading a second JPEG background and probing a WebP poster. The native image uses the collection's WebP sources instead. Playback and API-readiness handling still use the patched embed.

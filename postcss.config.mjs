import browserslist from 'browserslist'
import postcssLightningcss from 'postcss-lightningcss'
import sortMediaQueries from 'postcss-sort-media-queries'

const production = process.env.NODE_ENV === 'production'

export default {
  plugins: [
    sortMediaQueries,
    {
      // workaround for :where
      postcssPlugin: 'inaccurate-pseudo-where',
      Rule(rule) {
        rule.selector = rule.selector?.replaceAll(/:where\((\.astro-\w+)\)/g, '$1')
      },
    },
    postcssLightningcss({
      browsers: browserslist(),
      lightningcssOptions: {
        minify: production,
      },
    }),
  ],
}

const browserslist = require('browserslist')
const postcssLightningcss = require('postcss-lightningcss')

const production = process.env.NODE_ENV === 'production'

module.exports = {
  plugins: [
    require('postcss-sort-media-queries'),
    postcssLightningcss({
      browsers: browserslist(),
      lightningcssOptions: {
        minify: production,
      },
    }),
  ],
};

const browserslist = require('browserslist')
const postcssLightningcss = require('postcss-lightningcss')

const production = process.env.NODE_ENV === 'production'

module.exports = {
    plugins: [
        require('postcss-sort-media-queries'),
        {
            // workaround for :where
            postcssPlugin: "inaccurate-pseudo-where",
            Rule(rule) {
                rule.selector = rule.selector?.replace(/:where\((\.astro-\w+)\)/g, "$1");
            },
        },
        postcssLightningcss({
            browsers: browserslist(),
            lightningcssOptions: {
                minify: production,
            },
        }),
    ],
};

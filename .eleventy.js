const fs = require("fs/promises");
const path = require("path");
const svgSprite = require('./utils/svgsprite.js')
const htmlmin = require("html-minifier")

const INPUT_DIR = "src";
const OUTPUT_DIR = "_site";

// This will change both Eleventy's pathPrefix, and the one output by the
// vite-related shortcodes below. Double-check if you change this, as this is only a demo :)
const PATH_PREFIX = "/";

module.exports = function (eleventyConfig) {
    eleventyConfig.addNunjucksFilter("selectAttrEq", function (input, attr, value) {
        if (input !== undefined && Array.isArray(input)) {
            return input.filter(item => item[attr] === value)
        }
    });

    // SVG Sprite
    eleventyConfig.addNunjucksAsyncShortcode('svgSprite', svgSprite)

    // rebuild on changes
    eleventyConfig.addWatchTarget("./src/js/*.js")
    eleventyConfig.addWatchTarget("./src/assets/css/*.css")

    // STATIC FILES
    eleventyConfig.addPassthroughCopy({'./src/static/': '/'});
    eleventyConfig.addPassthroughCopy({'./src/js/': '/assets/'});

    eleventyConfig.addPassthroughCopy({
        "./node_modules/vanilla-lazyload/dist/lazyload.min.js": "assets/lazyload.min.js",
        "./node_modules/gumshoejs/dist/gumshoe.polyfills.min.js": "assets/gumshoe.polyfills.min.js"
    });

    // TRANSFORM -- Minify HTML Output
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        if (outputPath && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
            return minified;
        }
        return content;
    });

    return {
        templateFormats: ["njk", "html"],
        pathPrefix: PATH_PREFIX,
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dataTemplateEngine: "njk",
        passthroughFileCopy: true,
        dir: {
            input: INPUT_DIR,
            output: OUTPUT_DIR,
            // NOTE: These two paths are relative to dir.input
            // @see https://github.com/11ty/eleventy/issues/232
            includes: "_includes",
            data: "_data",
        },
    };
};

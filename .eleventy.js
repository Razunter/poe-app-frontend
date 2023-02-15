const svgSprite = require('./utils/svgsprite.js')
const htmlmin = require("html-minifier")
const purgeCssPlugin = require("eleventy-plugin-purgecss")
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster')
const _ = require('lodash')
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const UpgradeHelper = require("@11ty/eleventy-upgrade-help");

const INPUT_DIR = "src"
const OUTPUT_DIR = "_site"

// This will change both Eleventy's pathPrefix, and the one output by the
// vite-related shortcodes below. Double-check if you change this, as this is only a demo :)
const PATH_PREFIX = "/"

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksFilter("selectAttrEq", function (input, attr, value) {
    if (input !== undefined && Array.isArray(input)) {
      return input.filter(item => item[attr] === value)
    }
  })
  eleventyConfig.addNunjucksFilter("getVideoID", function (input, type) {
    if (input !== undefined) {
      switch (type) {
        case "youtube":
          return input.substring(input.lastIndexOf("?v=") + 3)
        case "twitch":
          return input.substring(input.lastIndexOf("/") + 1)
      }
    }
    return input
  })
  eleventyConfig.addNunjucksFilter("getVarFromString", function (varName) {
    return this.ctx[varName.replace('.', '-')]
  })
  eleventyConfig.addNunjucksFilter("getVideoType", function (input) {
    if (input !== undefined) {
      let type = 'novideo'
      if (input.indexOf('youtube.com') !== -1) {
        type = 'youtube'
      } else if (input.indexOf('twitch.tv') !== -1) {
        type = 'twitch'
      }
      return type
    } else {
      return 'novideo'
    }
  })

  eleventyConfig.addNunjucksFilter("limit", function (input, length) {
    input.splice(0, input.length - length)
    return input
  })

  // SVG Sprite
  eleventyConfig.addNunjucksAsyncShortcode('svgSprite', svgSprite)

  eleventyConfig.addNunjucksGlobal('strIncludes', (string, inc) => {
    return string.includes(inc)
  })

  eleventyConfig.addNunjucksGlobal('isBuildCurrent', (buildVersions, thisPageVersion, allVersions) => {
    if (buildVersions !== undefined && Array.isArray(buildVersions)) {
      if (buildVersions.includes(thisPageVersion)) {
        return true
      } else {
        const versionData = allVersions.find((version) => {
          return version.version === thisPageVersion
        })
        if (versionData?.compatible && Array.isArray(versionData.compatible)) {
          return _.intersection(versionData.compatible, buildVersions).length > 0
        }
      }
    }

    return false
  })

  // rebuild on changes
  // eleventyConfig.addWatchTarget("./src/js/*.js")
  // eleventyConfig.addWatchTarget("./src/assets/css/*.css")

  eleventyConfig.setServerOptions({
    files: ['_site/**/*'],
  })

  // STATIC FILES
  eleventyConfig.addPassthroughCopy({ './src/static/': '/' })
  // eleventyConfig.addPassthroughCopy({'./src/js/': '/assets/'});

  eleventyConfig.addPlugin(EleventyRenderPlugin);

  if (process.env.NODE_ENV === "production") {
    eleventyConfig.addPlugin(purgeCssPlugin, {
      // Optional: Specify the location of your PurgeCSS config
      config: "./purgecss.config.js",

      // Optional: Set quiet: true to suppress terminal output
      quiet: false,
    })

    // TRANSFORM -- Minify HTML Output
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
      if (outputPath && outputPath.endsWith(".html")) {
        return htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        })
      }
      return content
    })

    eleventyConfig.addPlugin(cacheBuster({}))
  }

  eleventyConfig.addPlugin(UpgradeHelper);

  return {
    templateFormats: ["njk"],
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
  }
}

import {babel} from '@rollup/plugin-babel'
import {defineConfig} from 'astro/config'
import compress from 'astro-compress'
import purgecss from 'astro-purgecss'
import robotsTxt from 'astro-robots-txt'
import path from 'path'

const production = process.env.NODE_ENV === 'production'

export default defineConfig({
  integrations: [
    robotsTxt({
      sitemap: false,
    }),
    production ? purgecss({
      safelist: ['iframe'],
    }) : [],
    production ? compress() : [],
  ],
  site: 'https://raz-poebuilds.netlify.app',
  vite: {
    resolve: {
      alias: {
        '@css/': `${path.resolve('./src/styles')}/`,
        '@src/': `${path.resolve('./src')}/`,
        '@img/': `${path.resolve('./src/images')}/`,
      },
    },
    optimizeDeps: {
      exclude: ['@resvg'],
    },
    build: {
      rollupOptions: {
        plugins: [
          production ? babel({
            babelHelpers: 'bundled',
            extensions: ['.js', '.ts'],
            presets: [
              [
                '@babel/preset-env',
                {
                  debug: false,
                  modules: 'auto',
                  useBuiltIns: 'usage',
                  bugfixes: true,
                  corejs: {
                    version: '3.28.0',
                    proposals: true,
                  },
                },
              ],
            ],
            exclude: [/\/core-js\//u, 'node_modules/**'],
          }) : [],
        ],
      },
    },
  },
  output: 'static',
})

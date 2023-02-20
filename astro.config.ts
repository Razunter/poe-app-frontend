import {defineConfig} from 'astro/config'
import compress from 'astro-compress'
import robotsTxt from 'astro-robots-txt'
import path from 'path'
import lightningcss from 'vite-plugin-lightningcss'

// https://astro.build/config
export default defineConfig({
  integrations: [robotsTxt(), compress()],
  site: 'https://raz-poebuilds.netlify.app',
  vite: {
    resolve: {
      alias: {
        '@css/': `${path.resolve('./src/styles')}/`,
        '@src/': `${path.resolve('./src')}/`,
        '@img/': `${path.resolve('./src/images')}/`,
      },
    },
    plugins: [
      lightningcss({
        minify: process.env.NODE_ENV === 'production',
      }),
    ],
    optimizeDeps: {
      exclude: ['@resvg'],
    },
  },
  output: 'static',
})

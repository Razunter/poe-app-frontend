import { babel } from '@rollup/plugin-babel'
import compress from 'astro-compress'
import purgecss from 'astro-purgecss'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'
import type { Logger } from 'sass'
import tsconfigPaths from 'vite-tsconfig-paths'

const production = process.env.NODE_ENV === 'production'

const silenceSomeSassDeprecationWarnings = {
  verbose: true,
  logger: {
    warn(message, options) {
      const { stderr } = process;
      const span = options.span ?? undefined;
      const stack = (options.stack === 'null' ? undefined : options.stack) ?? undefined;

      if (options.deprecation) {
        if (message.startsWith('Sass\'s behavior for declarations that appear after nested')) {
          // silences above deprecation warning
          return;
        }
        stderr.write('DEPRECATION ');
      }
      stderr.write(`WARNING: ${message}\n`);

      if (span !== undefined) {
        // output the snippet that is causing this warning
        stderr.write(`\n"${span.text}"\n`);
      }

      if (stack !== undefined) {
        // indent each line of the stack
        stderr.write(`    ${stack.toString().trimEnd().replace(/\n/gm, '\n    ')}\n`);
      }

      stderr.write('\n');
    }
  } satisfies Logger
}

export default defineConfig({
  integrations: [
    robotsTxt({
      sitemap: false,
    }),
    production
      ? purgecss({
          safelist: ['iframe'],
        })
      : [],
    production ? compress() : [],
  ],
  site: 'https://raz-poebuilds.netlify.app',
  vite: {
    plugins: [tsconfigPaths()],
    optimizeDeps: {
      exclude: ['@resvg'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          ...silenceSomeSassDeprecationWarnings,
          quietDeps: true,
        },
      },
    },
    build: {
      rollupOptions: {
        plugins: [
          production
            ? babel({
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
                        version: '3.48.0',
                        proposals: true,
                      },
                    },
                  ],
                ],
                exclude: [/\/core-js\//u, 'node_modules/**'],
              })
            : [],
        ],
      },
    },
  },
  output: 'static',
})

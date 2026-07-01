import babel from "@rolldown/plugin-babel";
import purgecss from "astro-purgecss";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import corejsPackage from "core-js/package.json" with { type: "json" }

const production = process.env.NODE_ENV === "production";

export default defineConfig({
  integrations: [
    robotsTxt({
      sitemap: false,
    }),
    production
      ? purgecss({
        safelist: ["iframe"],
      })
      : [],
  ],
  site: "https://raz-poebuilds.netlify.app",
  vite: {
    optimizeDeps: {
      exclude: ["@resvg"],
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
    plugins: [
      production
        ? babel({
          plugins: [
            ["polyfill-corejs3",
              {
                method: "usage-global",
                version: corejsPackage.version,
              },
            ],
          ],
          presets: [
            [
              "@babel/preset-env",
              {
                "corejs": corejsPackage.version,
                "modules": false,
              },
            ],
          ],
          exclude: [/\/core-js\//u, /\0rolldown\/runtime\.js/u, "node_modules/**"],
        })
        : [],
    ],
  },
  output: "static",
});

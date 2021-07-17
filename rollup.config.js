import scss from 'rollup-plugin-scss'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import cssnano from 'cssnano'
import path from 'path'
import nodePolyfills from 'rollup-plugin-node-polyfills'

const dev = process.env.NODE_ENV !== 'production'

const postcssPlugins = [
    autoprefixer()
]

// If we are in production mode, then add cssnano
if (!dev) {
    postcssPlugins.push(
        cssnano({
            // use the safe preset so that it doesn't
            // mutate or remove code from our css
            preset: 'default',
        })
    )
}

export default {
    input: 'src/js/index.js',
    output: {
        sourcemap: process.env.NODE_ENV !== 'production',
        format: 'iife',
        name: 'main',
        file: '_site/assets/main.bundle.js',
    },
    plugins: [
        scss({
            sourceMap: process.env.NODE_ENV !== 'production',
            processor: () => postcss(postcssPlugins),
            // outputStyle: dev ? 'expanded' : 'compressed',
            includePaths: [
                path.join(__dirname, '/node_modules'),
                'node_modules'
            ]
        }),
        nodePolyfills(),
        nodeResolve(),
        commonjs(),
        process.env.NODE_ENV === 'production' && terser(),
    ],
    watch: {
        clearScreen: false,
    },
}

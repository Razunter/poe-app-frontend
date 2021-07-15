import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';

export default {
    input: 'src/js/index.js',
    output: {
        sourcemap: false,
        format: 'iife',
        name: 'main',
        file: '_site/assets/main.bundle.js',
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        postcss({
            extract: path.resolve('_site/assets/main.bundle.css'),
            minimize: !dev,
        }),
        !dev && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};

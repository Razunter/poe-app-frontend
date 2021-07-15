import scss from 'rollup-plugin-scss'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cssnano from "cssnano";
import path from "path";

const dev = process.env.NODE_ENV !== 'production';

const postcssConfig = {
	plugins: [autoprefixer()],
};

// If we are in production mode, then add cssnano
if (!dev) {
	postcssConfig.plugins.push(
        cssnano({
			// use the safe preset so that it doesn't
			// mutate or remove code from our css
			preset: 'default',
		})
	);
}

console.log(path.join(__dirname, '/node_modules'))

export default {
    input: 'src/js/index.js',
    output: {
        sourcemap: !dev,
        format: 'iife',
        name: 'main',
        file: '_site/assets/main.bundle.js',
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        scss({
            sourceMap: !dev,
            processor: () => postcss(postcssConfig),
            includePaths: [
                path.join(__dirname, '/node_modules'),
                'node_modules'
            ]
        }),
        !dev && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};

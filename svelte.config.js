import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		preserveComments: false,
		preserveWhitespace: false
	},
	kit: {
		adapter: adapter({
			precompress: false,
			polyfill: false
		}),
		alias: {
			$api: './src/api',
			$components: './src/components',
			$lib: './src/lib',
			$routeparams: './src/types/routeparams',
			$routes: './src/routes',
			$types: './src/types'
		},
		files: {
			params: 'src/types/routeparams'
		},
		output: {
			bundleStrategy: 'single'
		}
	}
};

export default config;

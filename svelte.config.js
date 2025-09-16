import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		preserveComments: false,
		preserveWhitespace: false,
		experimental: {
			async: true
		}
	},
	kit: {
		adapter: adapter({
			precompress: false,
			polyfill: false
		}),
		alias: {
			$components: './src/components',
			$lib: './src/lib',
			$routeparams: './src/types/routeparams',
			$routes: './src/routes',
			$rpc: './src/rpc',
			$types: './src/types'
		},
		output: {
			bundleStrategy: 'single'
		}
	}
};

export default config;

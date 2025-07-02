/* eslint-disable unicorn/relative-url-style */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { configDefaults, defineConfig } from 'vitest/config';

const importMeta = import.meta.url;

export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	test: {
		environment: 'node',
		setupFiles: './tests/integration.setup.ts',
		exclude: [...configDefaults.exclude, '**/*.svelte']
	},
	resolve: {
		alias: {
			$api: new URL('./src/api', importMeta).pathname,
			$components: new URL('./src/components', importMeta).pathname,
			$lib: new URL('./src/lib', importMeta).pathname,
			$routeparams: new URL('./src/types/routeparams', importMeta).pathname,
			$routes: new URL('./src/routes', importMeta).pathname,
			$types: new URL('./src/types', importMeta).pathname
		}
	}
});

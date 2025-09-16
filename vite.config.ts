import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import circularDependency from 'vite-plugin-circular-dependency';
import devtoolsJson from 'vite-plugin-devtools-json';

import { version } from './package.json';

export default defineConfig({
	plugins: [
		sveltekit(),
		devtoolsJson(),
		circularDependency({
			circleImportThrowErr: true,
			exclude: [/node_modules/, /\.git/, /Modal/]
		})
	],
	build: {
		sourcemap: false,
		minify: true,
		cssMinify: true,
		emptyOutDir: true,
		chunkSizeWarningLimit: 4096,
		rollupOptions: {
			treeshake: true,
			output: {
				compact: true
				// manualChunks: (id) => {
				// 	if (id.includes('node_modules')) return 'vendor';
				// 	if (id.includes('/src/components/')) return 'components';
				// 	if (id.includes('/src/routes/')) return 'routes';
				// }
			}
		}
	},
	define: {
		__APP_VERSION__: JSON.stringify(version)
	},
	clearScreen: true
});

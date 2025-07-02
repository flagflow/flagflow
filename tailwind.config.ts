import typography from '@tailwindcss/typography';
import flowbitePlugin from 'flowbite/plugin';
import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	darkMode: 'selector',
	theme: {
		extend: {
			colors: {
				// flowbite-svelte
				primary: {
					50: '#FFF5F2',
					100: '#FFF1EE',
					200: '#FFE4DE',
					300: '#FFD5CC',
					400: '#FFBCAD',
					500: '#FE795D',
					600: '#EF562F',
					700: '#EB4F27',
					800: '#CC4522',
					900: '#A5371B'
				},
				purple: {
					50: '#E0F5FA',
					100: '#BAE6F1',
					200: '#9CD4E7',
					300: '#82C0DA',
					400: '#67ABCA',
					500: '#5395B6',
					600: '#447E9A',
					700: '#35667E',
					800: '#284F62',
					900: '#1C3846'
				}
			}
		}
	},

	plugins: [flowbitePlugin, typography]
} as Config;

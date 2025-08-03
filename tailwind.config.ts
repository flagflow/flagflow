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
					50: '#B3D0E5',
					100: '#A5C8E0',
					200: '#8AB8D7',
					300: '#6FA7CE',
					400: '#5597C4',
					500: '#3E86B7',
					600: '#35729C',
					700: '#2C5E81',
					800: '#234B66',
					900: '#1A374C'
				},
				secondary: {
					50: '#fef7ed',
					100: '#fdead7',
					200: '#fbd5ae',
					300: '#f7b27a',
					400: '#f18744',
					500: '#ea5d1f',
					600: '#dc4a15',
					700: '#b73815',
					800: '#942f18',
					900: '#792917',
					950: '#41130a'
				}
			}
		}
	},

	plugins: [flowbitePlugin, typography]
} as Config;

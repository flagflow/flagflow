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
					50: '#DFDDB9',
					100: '#D9D7AC',
					200: '#CECC93',
					300: '#C2C07B',
					400: '#B7B462',
					500: '#A8A54D',
					600: '#908D41',
					700: '#777536',
					800: '#5E5D2B',
					900: '#464420'
				}
			}
		}
	},

	plugins: [flowbitePlugin, typography]
} as Config;

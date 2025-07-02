import { readable } from 'svelte/store';

const mediaQueryStore = (query: string) => {
	if (typeof window === 'undefined') return readable(false);

	const mediaQueryList = window.matchMedia(query);

	return readable(mediaQueryList.matches, (set) => {
		const handleChange = () => set(mediaQueryList.matches);
		mediaQueryList.addEventListener('change', handleChange);
		return () => mediaQueryList.removeEventListener('change', handleChange);
	});
};

export const isMobileView = mediaQueryStore('(min-width: 768px)');

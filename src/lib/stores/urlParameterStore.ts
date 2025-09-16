import { writable } from 'svelte/store';

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/stores';
import { safeUrl } from '$lib/urlEx';

interface UrlParameterStoreOptions {
	key: string;
	defaultValue?: string;
	debounce?: number;
}

export const urlParameterStore = (options: UrlParameterStoreOptions) => {
	const { key, defaultValue, debounce = 0 } = options;
	const initialValue = browser
		? new URLSearchParams(window.location.search).get(key) || defaultValue || ''
		: defaultValue || '';
	const { subscribe, set, update } = writable<string>(initialValue);

	let timeout: ReturnType<typeof setTimeout>;

	if (browser)
		page.subscribe(($page) => {
			const parameterValue = $page.url.searchParams.get(key) || defaultValue || '';
			if (parameterValue !== initialValue) set(parameterValue);
		});

	const setAndUrl = (value: string) => {
		set(value);
		if (browser) {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				const url = safeUrl(window.location.href);
				if (!url) return;
				if (value) url.searchParams.set(key, value);
				else url.searchParams.delete(key);
				goto(resolve(url.toString(), {}), { replaceState: true, noScroll: true, keepFocus: true });
			}, debounce);
		}
	};

	return {
		subscribe,
		set: setAndUrl,
		update
	};
};

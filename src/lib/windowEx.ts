import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import { safeUrl } from './urlEx';

export const updateQueryParameters = (key: string, value: string | undefined) => {
	if (typeof window === 'undefined') return;

	const url = safeUrl(window.location.href);
	if (!url) return;

	if (value === undefined) url.searchParams.delete(key);
	else url.searchParams.set(key, value);

	goto(resolve(url.toString(), {}), { replaceState: true });
};

export const numberFormatter = Intl.NumberFormat(
	typeof window === 'undefined' ? undefined : navigator.language,
	{ style: 'decimal' }
);
export const numberFormatterSignDisplay = Intl.NumberFormat(
	typeof window === 'undefined' ? undefined : navigator.language,
	{ style: 'decimal', signDisplay: 'always' }
);

import { goto } from '$app/navigation';

export const updateQueryParameters = (key: string, value: string | undefined) => {
	if (typeof window === 'undefined') return;

	const url = new URL(window.location.href);
	if (value === undefined) url.searchParams.delete(key);
	else url.searchParams.set(key, value);

	goto(url, { replaceState: true });
};

export const numberFormatter = Intl.NumberFormat(
	typeof window === 'undefined' ? undefined : navigator.language,
	{ style: 'decimal' }
);
export const numberFormatterSignDisplay = Intl.NumberFormat(
	typeof window === 'undefined' ? undefined : navigator.language,
	{ style: 'decimal', signDisplay: 'always' }
);

import { derived, get, type Readable, type Writable, writable } from 'svelte/store';

import { updateQueryParameters } from './windowEx';

export const isStringStore = (value: Writable<unknown>): value is Writable<string> =>
	typeof get(value) === 'string';

export const debouncedStore = <T extends string | number | boolean>(
	stores: Readable<T>,
	delayMs: number,
	fastInit = true
) => {
	let initState = fastInit;
	return derived(stores, ($inputStore, set) => {
		if (initState) {
			set($inputStore);
			initState = false;
			return;
		}

		const timeout = setTimeout(() => {
			set($inputStore);
		}, delayMs);

		return () => clearTimeout(timeout);
	}) as Readable<T>;
};

const getUrlParameters = () =>
	typeof window === 'undefined' ? undefined : new URLSearchParams(window.location.search);

export const queryParameterStringStore = (
	key: string,
	initValue?: string,
	defaultValue?: string
) => {
	const parameters = getUrlParameters();
	initValue ??= parameters?.get(key) ?? defaultValue ?? '';

	const { subscribe, set, update } = writable<string>(initValue);
	subscribe((value) => updateQueryParameters(key, value || undefined));
	return {
		subscribe,
		set: (value: string | undefined | null) => set(value ?? ''),
		update
	} as Writable<string>;
};

export const queryParameterNumberStore = (
	key: string,
	initValue?: number,
	defaultValue?: number
) => {
	const parameters = getUrlParameters();
	initValue ??=
		(parameters?.has(key) ? Number.parseFloat(parameters?.get(key) ?? '0') : undefined) ??
		defaultValue ??
		0;

	const { subscribe, set, update } = writable<number>(initValue);
	subscribe((value) => updateQueryParameters(key, value ? value.toString() : undefined));
	return {
		subscribe,
		set: (value: number | undefined | null) => set(value ?? 0),
		update
	} as Writable<number>;
};

export const queryParameterBooleanStore = (
	key: string,
	initValue?: boolean,
	defaultValue?: boolean
) => {
	const parameters = getUrlParameters();
	initValue ??=
		(parameters?.has(key) ? parameters?.get(key) === 'true' : undefined) ?? defaultValue ?? false;

	const { subscribe, set, update } = writable<boolean>(initValue);
	subscribe((value) => updateQueryParameters(key, value ? 'true' : undefined));
	return {
		subscribe,
		set: (value: boolean | undefined | null) => set(value ?? false),
		update
	} as Writable<boolean>;
};

export const queryParameterClearableStringStore = (key: string, initValue?: string | undefined) => {
	const { subscribe, set, update } = writable<string>(initValue);
	// eslint-disable-next-line unicorn/no-useless-undefined
	subscribe(() => updateQueryParameters(key, undefined));
	return {
		subscribe,
		set: () => set(''),
		update
	} as Writable<string>;
};

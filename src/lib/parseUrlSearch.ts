import { getDateIntervals } from './dateInterval';

type UrlParser<T> = (value: string | null) => T;

// Parsers
export const urlBooleanParser: UrlParser<boolean> = (value) => value === 'true';

export const urlNumberParser: UrlParser<number | undefined> = (value) =>
	value ? Number(value) : undefined;

export const urlStringParser: UrlParser<string | undefined> = (value) => value ?? undefined;

export const urlLookupParser =
	(
		abc: (id: number) => Promise<string>
	): UrlParser<Promise<{ value: number; name: string } | undefined>> =>
	async (value) =>
		value ? { value: Number(value), name: await abc(Number(value)) } : undefined;

// Special parsers
const createUrlStringParser =
	<T>(transform: (value: string | undefined) => T): UrlParser<T> =>
	(value) =>
		transform(value ?? undefined);

export const urlDateIntervalParser: UrlParser<string | undefined> = createUrlStringParser(
	(value) => {
		const usableIntervals = getDateIntervals();
		return usableIntervals.includes(value ?? '') ? value : usableIntervals[0];
	}
);

// Implmenetation
type UrlAnyParser =
	| typeof urlBooleanParser
	| typeof urlNumberParser
	| typeof urlStringParser
	| ReturnType<typeof urlLookupParser>;

type ParseUrlSearchResult<T> = {
	[P in keyof T]: T[P] extends UrlParser<infer R>
		? R extends Promise<infer U>
			? U // Resolve the promise
			: R
		: never;
};

export const parseUrlSearch = async <T extends Record<string, UrlAnyParser>>(
	search: URLSearchParams,
	keys: T
): Promise<ParseUrlSearchResult<T>> => {
	const result = {} as ParseUrlSearchResult<T>;

	if (keys)
		for (const key in keys) {
			if (Object.prototype.hasOwnProperty.call(keys, key)) {
				const value = search.get(key);
				const parser = keys[key];

				const parsedValue = parser(value);
				result[key] =
					parsedValue instanceof Promise
						? ((await parsedValue) as ParseUrlSearchResult<T>[typeof key])
						: (parsedValue as ParseUrlSearchResult<T>[typeof key]);
			}
		}

	return result;
};

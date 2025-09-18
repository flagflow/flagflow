import { camelCaseToHuman, trim } from './stringEx';
import type { NullableNumberKeys, NumberKeys } from './typeEx';

export const sortObjectByKey = <T extends Record<string, unknown>>(
	object: T
): { [K in keyof T]: T[K] } =>
	Object.fromEntries(
		Object.entries(object).toSorted(([keyA], [keyB]) => keyA.localeCompare(keyB))
	) as {
		[K in keyof T]: T[K];
	};

export const sortMapByKey = <K extends string, V>(
	map: Map<K, V>,
	reverse: boolean = false
): Map<K, V> =>
	new Map(
		[...map.entries()].toSorted(([keyA], [keyB]) => keyA.localeCompare(keyB) * (reverse ? -1 : 1))
	);

export const filterObjectFields = <T extends object>(object: object, allowedKeys: (keyof T)[]): T =>
	Object.fromEntries(
		Object.entries(object).filter(([key]) => allowedKeys.includes(key as keyof T))
	) as T;

export const trimObjectValues = <T extends Record<string, unknown>>(data: T): T => {
	if (data)
		for (const key in data) {
			const value = data[key];
			if (typeof value === 'string') data[key] = value.trim() as (typeof data)[typeof key];
		}
	return data;
};

export const makeObjectHumanReadable = (
	parameters: Record<string, string>
): Record<string, string> =>
	Object.fromEntries(
		Object.keys(parameters)
			.toSorted((a, b) => camelCaseToHuman(a).localeCompare(camelCaseToHuman(b)))
			.map((key) => [camelCaseToHuman(key), trim(JSON.stringify(parameters[key]), '"')])
	);

export const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');

export const searchObjectStringField = <T extends object>(
	item: T,
	searchTerms: string | string[]
): boolean => {
	const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
	return terms.every((term) => {
		const searchTerm = term.toLowerCase();
		return Object.values(item).some(
			(value) =>
				(typeof value === 'string' && value.toLowerCase().includes(searchTerm)) ||
				(isStringArray(value) && value.some((t) => t.toLowerCase().includes(searchTerm)))
		);
	});
};

export const joinLookupData = <K extends string, T extends object, U extends object>(
	data: T[],
	lookup: U[],
	resultField: K,
	match: {
		localId: NullableNumberKeys<T>;
		remoteId: NumberKeys<U>;
		remoteValue: keyof U;
	}
): (T & { [P in K]: string })[] =>
	data.map(
		(d) =>
			({
				...d,
				[resultField]: lookup.find(
					(l) => (l[match.remoteId] as number | null) == (d[match.localId] as number | null)
				)?.[match.remoteValue]
			}) as T & { [P in K]: string }
	);
// let products = joinLookupData(data.products, data.productCategories, 'productCategoryFullName', {
// 	localId: 'productCategoryId',
// 	remoteId: 'id',
// 	remoteValue: 'fullName'
// });

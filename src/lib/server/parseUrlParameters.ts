type ParsedParameters<T = Record<string, never>> = T & {
	otherParams: Record<string, string[]>;
};

type ParameterParser<T> = {
	[K in keyof T]: (value: string | null) => T[K];
};

const intParameterParser = (value: string | null, defaultValue = 0): number =>
	value ? Number.parseInt(value, 10) || defaultValue : defaultValue;

const booleanParameterParser = (value: string | null, defaultValue = false): boolean =>
	value ? ['true', '1'].includes(value.toLowerCase()) : defaultValue;

const stringParameterParser = (value: string | null, defaultValue = ''): string =>
	value ?? defaultValue;

export const parseUrlParameters = <T extends Record<string, unknown>>(
	searchParameters: URLSearchParams | string | undefined,
	parsers: ParameterParser<T>
): ParsedParameters<T> => {
	const parameters_ =
		typeof searchParameters === 'string' ? new URLSearchParams(searchParameters) : searchParameters;

	const result = {} as T;
	const otherParameters: Record<string, string[]> = {};
	const parsedKeys = new Set(Object.keys(parsers));

	if (parameters_) {
		for (const key of Object.keys(parsers) as (keyof T)[]) {
			const parser = parsers[key];
			const value = parameters_.get(key as string);
			result[key] = parser(value);
		}

		for (const [key, value] of parameters_.entries())
			if (!parsedKeys.has(key)) {
				if (!otherParameters[key]) otherParameters[key] = [];
				otherParameters[key].push(value);
			}
	}

	return {
		...result,
		otherParams: otherParameters
	};
};

export const existsParameterParser = (value: string | null): boolean => value !== null;

export const createIntParser =
	(defaultValue = 0) =>
	(value: string | null) =>
		intParameterParser(value, defaultValue);

export const createBooleanParser =
	(defaultValue = false) =>
	(value: string | null) =>
		booleanParameterParser(value, defaultValue);

export const createStringParser =
	(defaultValue = '') =>
	(value: string | null) =>
		stringParameterParser(value, defaultValue);

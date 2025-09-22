export const trim = (s: string, chars: string) => trimStart(trimEnd(s, chars), chars);

export const trimStart = (s: string, chars: string) => {
	let start = 0;
	while (start < s.length && chars.includes(s[start])) start++;
	return s.slice(start);
};

export const trimEnd = (s: string, chars: string) => {
	let end = s.length;
	while (end > 0 && chars.includes(s[end - 1])) end--;
	return s.slice(0, end);
};

export const camelCaseToHuman = (s: string) => {
	const withSpaces = s.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
	return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
};

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const capitalizeWords = (s: string, separator: string) =>
	s
		.split(separator)
		.map((element) => capitalize(element))
		.join(separator);

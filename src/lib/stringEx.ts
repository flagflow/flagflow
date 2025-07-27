export const trim = (s: string, chars: string) => trimStart(trimEnd(s, chars), chars);

export const trimStart = (s: string, chars: string) => {
	while (s.length > 0 && chars.includes(s.at(0)!)) s = s.slice(1);
	return s;
};

export const trimEnd = (s: string, chars: string) => {
	while (s.length > 0 && chars.includes(s.at(-1)!)) s = s.slice(0, -1);
	return s;
};

export const camelCaseToHuman = (s: string) =>
	s
		.replaceAll(/([a-z])([A-Z])/g, '$1 $2')
		.toLowerCase()
		.replace(/^./, (s) => s.toUpperCase());

export const capitalize = (s: string) =>
	s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const capitalizeWords = (s: string, separator: string) =>
	s
		.split(separator)
		.map((element) => capitalize(element))
		.join(separator);

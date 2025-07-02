export const extname = (filename: string): string => {
	const index = filename.lastIndexOf('.');
	return index === -1 ? '' : filename.slice(index);
};

export const basename = (filepath: string): string => filepath.split('/').pop() || '';

export const dirname = (filepath: string): string => {
	const index = filepath.lastIndexOf('/');
	return index === -1 ? '' : filepath.slice(0, index);
};

export const join = (delimiter: string, ...paths: string[]): string => paths.join(delimiter);

export const normalize = (path: string, delimiter: string = '/'): string =>
	path.replaceAll(new RegExp(`${delimiter}+`, 'g'), delimiter);

export const resolve = (path: string, delimiter: string = '/'): string => {
	const parts = path.split(delimiter);
	const resolvedParts = [];
	for (const part of parts)
		if (part === '..') resolvedParts.pop();
		else if (part !== '.') resolvedParts.push(part);
	return resolvedParts.join(delimiter);
};

export const relative = (from: string, to: string, delimiter: string = '/'): string => {
	const fromParts = from.split(delimiter);
	const toParts = to.split(delimiter);
	let index = 0;
	while (index < fromParts.length && index < toParts.length && fromParts[index] === toParts[index])
		index++;
	const relativeParts = toParts.slice(index);
	const parentParts = fromParts.slice(index);
	return parentParts.map(() => '..').join(delimiter) + delimiter + relativeParts.join(delimiter);
};

export const combineUrls = (base: string, ...paths: string[]): string => {
	if (paths.length === 0) return base;

	const validPaths = paths.filter(Boolean);
	if (validPaths.length === 0) return base;

	// Check if the last path ends with a slash to preserve it
	const lastPath = validPaths.at(-1);
	const shouldHaveTrailingSlash = lastPath?.endsWith('/') ?? false;

	const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
	const normalizedPaths = validPaths
		.map((path) => {
			// Remove leading and trailing slashes from paths
			let cleanPath = path;
			if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
			if (cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
			return cleanPath;
		})
		.filter(Boolean); // Remove empty strings after cleaning

	if (normalizedPaths.length === 0) return base;

	const result = [normalizedBase, ...normalizedPaths].join('/');
	return shouldHaveTrailingSlash ? result + '/' : result;
};

export const safeUrl = (url: string) => {
	try {
		return new URL(url);
	} catch {
		return;
	}
};

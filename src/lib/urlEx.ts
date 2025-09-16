export const combineUrls = (base: string, ...paths: string[]): string => {
	let combinedUrl = base;

	for (const path of paths) {
		if (!path) continue;

		combinedUrl = combinedUrl.endsWith('/') ? combinedUrl.slice(0, -1) : combinedUrl;
		const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
		combinedUrl = `${combinedUrl}/${cleanedPath}`;
	}

	return combinedUrl;
};

export const safeUrl = (url: string) => {
	try {
		return new URL(url);
	} catch {
		return;
	}
};

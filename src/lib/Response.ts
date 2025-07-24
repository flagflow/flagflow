export const HEADERS_NO_CACHE = {
	'Cache-Control': 'no-cache, no-store, must-revalidate',
	Pragma: 'no-cache',
	Expires: '0'
};

const createResponse = (
	body: string,
	options: { status: number; contentType: string; headers?: Record<string, string> | undefined }
) =>
	new Response(body, {
		status: options.status,
		headers: {
			'Content-Type': options.contentType,
			...HEADERS_NO_CACHE,
			...options.headers
		}
	});

export const createJsonResponse = (
	body: object,
	options: { headers?: Record<string, string>; status?: number } = {}
) =>
	createResponse(JSON.stringify(body), {
		...options,
		contentType: 'application/json',
		status: options.status ?? 200
	});

export const createTextResponse = (
	body: string,
	options: { headers?: Record<string, string>; status?: number } = {}
) => createResponse(body, { ...options, contentType: 'text/plain', status: options.status ?? 200 });

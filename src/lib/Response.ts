export const HEADERS_NO_CACHE = {
	'Cache-Control': 'no-cache, no-store, must-revalidate',
	Pragma: 'no-cache',
	Expires: '0'
};

const createResponse = (body: string, status: number, contentType: string) =>
	new Response(body, {
		status,
		headers: {
			'Content-Type': contentType,
			...HEADERS_NO_CACHE
		}
	});

export const createJsonResponse = (body: object, status = 200) =>
	createResponse(JSON.stringify(body), status, 'application/json');

export const createTextResponse = (body: string, status = 200) =>
	createResponse(body, status, 'text/plain');

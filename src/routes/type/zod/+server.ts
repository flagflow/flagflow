import { error } from '@sveltejs/kit';

import { createDownloadResponse, createTextResponse } from '$lib/Response';
import { existsParameterParser, parseUrlParameters } from '$lib/server/parseUrlParameters';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	// Parameters
	const url = new URL(event.request.url);
	const urlParsed = parseUrlParameters(url.searchParams, {
		download: existsParameterParser
	});
	if (Object.keys(urlParsed.otherParams).length > 0)
		return error(400, `Invalid query parameters: ${Object.keys(urlParsed.otherParams).join(', ')}`);

	// Service
	const flagService = event.locals.container.resolve('flagService');

	const zodFileContent = await flagService.getZodFileContent();
	if (!zodFileContent) return error(404, 'Failed to generate Zod schema');

	// Response
	return urlParsed.download
		? createDownloadResponse(zodFileContent, 'flagflowZod.ts')
		: createTextResponse(zodFileContent);
};

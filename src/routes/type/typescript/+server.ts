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

	const tsFileContent = await flagService.getTSFileContent();
	if (!tsFileContent) return error(404, 'TypeScript file not found');

	// Response
	return urlParsed.download
		? createDownloadResponse(tsFileContent, 'flagflowTypes.ts')
		: createTextResponse(tsFileContent);
};

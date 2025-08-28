import { error } from '@sveltejs/kit';

import { createDownloadResponse, createTextResponse } from '$lib/Response';
import { existsParameterParser, parseUrlParameters } from '$lib/server/parseUrlParameters';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, locals }) => {
	// Parameters
	const url = new URL(request.url);
	const urlParsed = parseUrlParameters(url.searchParams, {
		download: existsParameterParser
	});
	if (Object.keys(urlParsed.otherParams).length > 0)
		return error(400, `Invalid query parameters: ${Object.keys(urlParsed.otherParams).join(', ')}`);

	// Service
	const flagService = locals.container.resolve('flagService');

	const tsFileContent = await flagService.getTSFileContent();
	if (!tsFileContent) return error(404, 'Failed to generate TypeScript types');

	// Response
	return urlParsed.download
		? createDownloadResponse(tsFileContent, 'flagflowTypes.ts')
		: createTextResponse(tsFileContent);
};

import { error } from '@sveltejs/kit';

import { createJsonResponse, createTextResponse } from '$lib/Response';
import { formatFlagApiResponseENV, formatFlagApiResponseJson } from '$lib/server/flagApiFormatter';
import { createStringParser, parseUrlParameters } from '$lib/server/parseUrlParameters';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const url = new URL(event.request.url);

	const urlParsed = parseUrlParameters(url.searchParams, {
		format: createStringParser('json')
	});
	if (Object.keys(urlParsed.otherParams).length > 0)
		return error(400, `Invalid query parameters: ${Object.keys(urlParsed.otherParams).join(', ')}`);
	if (!['json', 'env'].includes(urlParsed.format))
		return error(400, 'Invalid format parameter: ' + urlParsed.format);

	const flagService = event.locals.container.resolve('flagService');
	const flagData = await flagService.getFlags(event.params.flaggroup);
	switch (urlParsed.format) {
		case 'json':
			return createJsonResponse(formatFlagApiResponseJson(flagData));
		case 'env':
			return createTextResponse(formatFlagApiResponseENV(flagData).join('\n'));
		default:
			return error(500, 'Unsupported format: ' + urlParsed.format);
	}
};

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
	if (!['json', 'env', 'plain'].includes(urlParsed.format))
		return error(400, 'Invalid format parameter: ' + urlParsed.format);

	const flagService = event.locals.container.resolve('flagService');
	const flagData = await flagService.getFlag(event.params.flagname);
	if (!flagData) return error(404, `Flag not found: ${event.params.flagname}`);

	switch (urlParsed.format) {
		case 'json':
			return createJsonResponse(
				formatFlagApiResponseJson(Object.fromEntries([[event.params.flagname, flagData]]))
			);
		case 'env':
			return createTextResponse(
				formatFlagApiResponseENV(Object.fromEntries([[event.params.flagname, flagData]])).join('\n')
			);
		case 'plain':
			return createTextResponse(
				String(flagData.valueExists ? flagData.value : flagData.defaultValue)
			);
		default:
			return error(500, 'Unsupported format: ' + urlParsed.format);
	}
};

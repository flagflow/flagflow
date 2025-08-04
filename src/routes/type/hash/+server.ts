import { error } from '@sveltejs/kit';

import { createJsonResponse, createTextResponse } from '$lib/Response';
import { formatFlagApiMapResponseENV } from '$lib/server/flagApiFormatter';
import { parseUrlParameters } from '$lib/server/parseUrlParameters';
import { createStringParser } from '$lib/server/parseUrlParameters';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	// Parameters
	const url = new URL(event.request.url);
	const urlParsed = parseUrlParameters(url.searchParams, {
		format: createStringParser('json')
	});
	if (Object.keys(urlParsed.otherParams).length > 0)
		return error(400, `Invalid query parameters: ${Object.keys(urlParsed.otherParams).join(', ')}`);
	if (!['json', 'env'].includes(urlParsed.format))
		return error(400, 'Invalid format parameter: ' + urlParsed.format);

	// Service
	const flagService = event.locals.container.resolve('flagService');

	const groups = await flagService.getFlagGroups();
	const hashes: Record<string, string> = {};
	for (const group of groups) hashes[group || '#root'] = await flagService.getFlagGroupHash(group);

	// Response
	return urlParsed.format === 'env'
		? createTextResponse(formatFlagApiMapResponseENV(hashes).join('\n'))
		: createJsonResponse(hashes, { prettyJson: true });
};

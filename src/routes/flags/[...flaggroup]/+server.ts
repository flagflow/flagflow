import { error } from '@sveltejs/kit';

import {
	createJsonResponse,
	createTextResponse,
	HEADER_ACCEPT_FLAGGROUP_HASH,
	HEADER_FLAGGROUP_HASH
} from '$lib/Response';
import { formatFlagApiResponseENV, formatFlagApiResponseJson } from '$lib/server/flagApiFormatter';
import { createStringParser, parseUrlParameters } from '$lib/server/parseUrlParameters';

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
	const flagGroup = event.params.flaggroup;
	const acceptFlagGroupHash = event.request.headers.get(HEADER_ACCEPT_FLAGGROUP_HASH);

	const flagService = event.locals.container.resolve('flagService');

	let flagData = await flagService.getFlags(flagGroup);
	if (Object.keys(flagData).length === 0)
		return error(404, 'Group not found: ' + (flagGroup || '/'));
	const flagGroupPrefix = flagGroup ? flagGroup + '/' : '';
	const processedFlagData = Object.fromEntries(
		Object.entries(flagData).map(([name, flag]) => [name.slice(flagGroupPrefix.length), flag])
	);

	const flagGroupHash = await flagService.getFlagGroupHash(flagGroup);
	if (!flagGroupHash) return error(404, 'Group hash not found: ' + (flagGroup || '/'));

	// Response
	if (acceptFlagGroupHash && acceptFlagGroupHash !== flagGroupHash)
		return error(
			409,
			`Flag group (${flagGroup || '/'}) hash mismatch: client=${acceptFlagGroupHash}, server=${flagGroupHash}`
		);

	switch (urlParsed.format) {
		case 'json':
			return createJsonResponse(formatFlagApiResponseJson(flagData), {
				headers: { [HEADER_FLAGGROUP_HASH]: flagGroupHash }
			});
		case 'env':
			return createTextResponse(formatFlagApiResponseENV(flagData).join('\n'), {
				headers: { [HEADER_FLAGGROUP_HASH]: flagGroupHash }
			});
		default:
			return error(500, 'Unsupported format: ' + urlParsed.format);
	}
};

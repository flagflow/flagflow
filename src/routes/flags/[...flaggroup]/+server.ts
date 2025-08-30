import { error } from '@sveltejs/kit';

import {
	createJsonResponse,
	createTextResponse,
	HEADER_ACCEPT_FLAGGROUP_HASH,
	HEADER_FLAGGROUP_HASH
} from '$lib/Response';
import { formatFlagApiResponseENV, formatFlagApiResponseJson } from '$lib/server/flagApiFormatter';
import { createStringParser, parseUrlParameters } from '$lib/server/parseUrlParameters';
import { safeUrl } from '$lib/urlEx';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params, locals }) => {
	// Parameters
	const url = safeUrl(request.url);
	const urlParsed = parseUrlParameters(url?.searchParams, {
		format: createStringParser('json')
	});
	if (Object.keys(urlParsed.otherParams).length > 0)
		return error(400, `Invalid query parameters: ${Object.keys(urlParsed.otherParams).join(', ')}`);
	if (!['json', 'env'].includes(urlParsed.format))
		return error(400, 'Invalid format parameter: ' + urlParsed.format);

	// Service
	const flagGroup = params.flaggroup;
	const acceptFlagGroupHash = request.headers.get(HEADER_ACCEPT_FLAGGROUP_HASH);

	const flagService = locals.container.resolve('flagService');

	const flagData = await flagService.getFlags(flagGroup);
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
			return createJsonResponse(formatFlagApiResponseJson(processedFlagData), {
				headers: { [HEADER_FLAGGROUP_HASH]: flagGroupHash },
				prettyJson: true
			});
		case 'env':
			return createTextResponse(formatFlagApiResponseENV(processedFlagData).join('\n'), {
				headers: { [HEADER_FLAGGROUP_HASH]: flagGroupHash }
			});
		default:
			return error(500, 'Unsupported format: ' + urlParsed.format);
	}
};

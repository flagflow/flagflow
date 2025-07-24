import { HttpError } from '$lib/HttpError';
import { existsParameterParser, parseUrlParameters } from '$lib/parseUrlParameters';
import { createJsonResponse, createTextResponse } from '$lib/Response';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	try {
		const url = new URL(event.request.url);

		const urlParsed = parseUrlParameters(url.searchParams, {
			plain: existsParameterParser,
			json: existsParameterParser
		});
		if (Object.keys(urlParsed.otherParams).length > 0)
			throw new HttpError(
				`Invalid query parameters: ${Object.keys(urlParsed.otherParams).join(', ')}`,
				400
			);
		if (urlParsed.plain && urlParsed.json)
			throw new HttpError(
				'Cannot use both "plain" and "json" query parameters at the same time',
				400
			);

		const flag = {
			url,
			plain: urlParsed.plain,
			json: urlParsed.json,
			name: event.params.flagname
		};

		return createJsonResponse(flag);
	} catch (error) {
		return error instanceof HttpError
			? error.getResponse()
			: createTextResponse('Internal Server Error', 500);
	}
};

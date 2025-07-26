import { error } from '@sveltejs/kit';

import { createTextResponse } from '$lib/Response';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const flagService = event.locals.container.resolve('flagService');

	const tsFileContent = await flagService.getTSFileContent();
	if (!tsFileContent) return error(404, 'TypeScript file not found');

	return createTextResponse(tsFileContent);
};

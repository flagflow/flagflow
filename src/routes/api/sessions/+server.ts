import { error } from '@sveltejs/kit';

import { createJsonResponse } from '$lib/Response';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.authentication.success) return error(403, 'Unauthorized');

	const persistentService = locals.container.resolve('persistentService');
	const { list: sessions } = await persistentService.list('session');

	return createJsonResponse({
		sessions
	});
};

import { error } from '@sveltejs/kit';

import { createJsonResponse } from '$lib/Response';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.authentication.success) return error(403, 'Unauthorized');
	if (locals.authentication.type !== 'SESSION') return error(403, 'Unauthorized');

	const sessionService = locals.container.resolve('sessionService');
	try {
		await sessionService.deleteSession(locals.authentication.sessionId);
		return createJsonResponse({
			status: 'success'
		});
	} catch (error_) {
		return error(403, `${error_ instanceof Error ? error_.message : 'Logout error'}`);
	}
};

import { error } from '@sveltejs/kit';

import { createJsonResponse } from '$lib/Response';

import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.authentication.success) return error(403, 'Unauthorized');

	await locals.rpcCaller.session.delete({ sessionId: params.id });

	return createJsonResponse({
		success: true
	});
};

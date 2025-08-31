import { createJsonResponse } from '$lib/Response';

import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	await locals.rpcCaller.session.delete({ sessionId: params.id });

	return createJsonResponse({
		success: true
	});
};

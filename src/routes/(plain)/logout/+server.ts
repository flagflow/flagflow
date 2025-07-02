import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const sessionService = locals.container.resolve('sessionService');
	const sessionId = locals.container.resolve('sessionId');

	//if (sessionId) await sessionService.deleteSession(sessionId);

	throw redirect(302, '/');
};

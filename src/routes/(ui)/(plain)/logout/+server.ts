import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const sessionService = locals.container.resolve('sessionService');
	if (locals.authentication.type === 'SESSION') {
		const sessionId = locals.authentication.sessionId;
		if (sessionId) {
			await sessionService.deleteSession(sessionId);
		}
	}
	throw redirect(302, '/');
};

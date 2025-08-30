import { error } from '@sveltejs/kit';

import { createJsonResponse } from '$lib/Response';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.authentication.success) return error(403, 'Unauthorized');

	const sessions = await locals.rpcCaller.session.getList();

	const resultSessions: Record<string, unknown> = {};
	for (const session of sessions)
		resultSessions[session.key] = {
			createdAt: session.createdAt,
			expiredAt: new Date(session.expiredAt),
			user: {
				key: session.userKey,
				name: session.userName,
				permissions: session.permissions
			}
		};

	return createJsonResponse({
		sessions: resultSessions
	});
};

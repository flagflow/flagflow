import { error } from '@sveltejs/kit';

import { createJsonResponse } from '$lib/Response';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	try {
		await locals.rpcCaller.login.logout();
		return createJsonResponse({
			status: 'success'
		});
	} catch (error_) {
		return error(403, `${error_ instanceof Error ? error_.message : 'Logout error'}`);
	}
};

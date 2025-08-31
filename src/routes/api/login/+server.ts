import { error } from '@sveltejs/kit';
import z from 'zod';

import { createJsonResponse } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';

import type { RequestHandler } from './$types';

const loginSchema = z.object({
	username: z.string().trim(),
	password: z.string()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const loginData = loginSchema.safeParse(await request.json());
	if (!loginData.success)
		return error(400, `Invalid request body: ${zodFlattenError(loginData.error.issues)}`);

	try {
		const { sessionId } = await locals.rpcCaller.login.login({
			username: loginData.data.username,
			password: loginData.data.password
		});

		return createJsonResponse({
			session: sessionId
		});
	} catch (error_) {
		return error(403, `${error_ instanceof Error ? error_.message : 'Login error'}`);
	}
};

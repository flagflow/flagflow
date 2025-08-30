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

	const userService = locals.container.resolve('userService');
	const sessionService = locals.container.resolve('sessionService');
	try {
		const user = await userService.authUser(loginData.data.username, loginData.data.password);
		const session = await sessionService.createSession({
			userKey: user.username,
			userName: user.username,
			createdAt: new Date(),
			permissions: user.permissions
		});
		return createJsonResponse({
			session
		});
	} catch (error_) {
		return error(403, `${error_ instanceof Error ? error_.message : 'Login error'}`);
	}
};

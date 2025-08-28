import { error } from '@sveltejs/kit';
import z from 'zod';

import { createJsonResponse } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';

import type { RequestHandler } from './$types';

const sessionDeleteSchema = z.object({
	session: z.string().trim()
});

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.authentication.success) return error(403, 'Unauthorized');

	const sessionDelete = sessionDeleteSchema.safeParse(await request.json());
	if (!sessionDelete.success)
		return error(400, `Invalid request body: ${zodFlattenError(sessionDelete.error.issues)}`);

	const sessionService = locals.container.resolve('sessionService');
	await sessionService.deleteSession(sessionDelete.data.session);

	return createJsonResponse({
		success: true
	});
};

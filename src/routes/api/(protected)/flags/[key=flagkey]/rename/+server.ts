import { error } from '@sveltejs/kit';
import z from 'zod';

import { createJsonResponse } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';

import type { RequestHandler } from './$types';

const schemaPATCH = z.object({
	name: z.string().trim(),
	description: z.string().trim()
});

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const flagData = schemaPATCH.safeParse(await request.json());
	if (!flagData.success)
		return error(400, `Invalid request body: ${zodFlattenError(flagData.error.issues)}`);

	await locals.rpcCaller.flag.rename({
		oldKey: params.key,
		recentKey: flagData.data.name,
		description: flagData.data.description
	});

	return createJsonResponse({
		success: true
	});
};

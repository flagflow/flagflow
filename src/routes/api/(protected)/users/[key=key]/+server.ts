import { error } from '@sveltejs/kit';
import z from 'zod';

import { createJsonResponse } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';
import { ZNonEmptyString } from '$rpc/zodTypes';
import { UserPermissionZodEnum } from '$types/UserPermissions';

import type { RequestHandler } from './$types';

const schemaPATCH = z.object({
	name: z.string().trim().optional(),
	password: ZNonEmptyString().optional(),
	mustChangePassword: z.boolean().optional(),
	permissions: z.array(UserPermissionZodEnum).optional(),
	enabled: z.boolean().optional()
});

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const userData = schemaPATCH.safeParse(await request.json());
	if (!userData.success)
		return error(400, `Invalid request body: ${zodFlattenError(userData.error.issues)}`);

	await locals.rpcCaller.user.update({
		key: params.key,
		...userData.data
	});

	return createJsonResponse({
		success: true
	});
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (params.key === locals.authentication.success?.userName)
		throw new Error('You cannot delete your own user account');

	await locals.rpcCaller.user.delete({ key: params.key });

	return createJsonResponse({
		success: true
	});
};

import { error } from '@sveltejs/kit';
import z from 'zod';

import { createJsonResponse } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';
import { ZNonEmptyString } from '$rpc/zodTypes';
import { PersistentUserKey } from '$types/persistent';
import { UserPermissionZodEnum } from '$types/UserPermissions';

import type { RequestHandler } from './$types';

const schemaPOST = z.object({
	key: PersistentUserKey.trim(),
	name: z.string().trim(),
	password: ZNonEmptyString(),
	permissions: z.array(UserPermissionZodEnum),
	mustChangePassword: z.boolean()
});

export const GET: RequestHandler = async ({ locals }) => {
	const users = await locals.rpcCaller.user.getList();

	const resultUsers: Record<string, unknown> = {};
	for (const user of users)
		resultUsers[user.key] = {
			name: user.name,
			permissions: user.permissions,
			enabled: user.enabled,
			passwordExpireAt: user.passwordExpireAt ? new Date(user.passwordExpireAt) : undefined
		};

	return createJsonResponse({
		users: resultUsers
	});
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const userData = schemaPOST.safeParse(await request.json());
	if (!userData.success)
		return error(400, `Invalid request body: ${zodFlattenError(userData.error.issues)}`);

	await locals.rpcCaller.user.create({ ...userData.data });

	return createJsonResponse({
		success: true
	});
};

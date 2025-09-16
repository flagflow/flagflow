import { error } from '@sveltejs/kit';
import z from 'zod';

import { createJsonResponse } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';
import { PersistentFlagKey } from '$types/persistent';
import { PersistentFlag } from '$types/persistent';

import type { RequestHandler } from './$types';

const schemaPOST = z.intersection(
	z.object({
		key: PersistentFlagKey.trim()
	}),
	PersistentFlag
);

export const PATCH: RequestHandler = async ({ locals, request }) => {
	const flagData = schemaPOST.safeParse(await request.json());
	if (!flagData.success)
		return error(400, `Invalid request body: ${zodFlattenError(flagData.error.issues)}`);

	await locals.rpcCaller.flag.updateSchema({
		key: flagData.data.key,
		flag: flagData.data,
		resetValue: false
	});
	await locals.rpcCaller.flag.updateValue({ key: flagData.data.key, flag: flagData.data });

	return createJsonResponse({
		success: true
	});
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	await locals.rpcCaller.flag.delete({ key: params.key });

	return createJsonResponse({
		success: true
	});
};

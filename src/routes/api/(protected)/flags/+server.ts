import { error } from '@sveltejs/kit';
import z from 'zod';

import { createJsonResponse } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';
import { PersistentFlag } from '$types/persistent';
import { PersistentFlagKey } from '$types/persistent';

import type { RequestHandler } from './$types';

const schemaPOST = z.intersection(
	z.object({
		key: PersistentFlagKey.trim()
	}),
	PersistentFlag
);

export const GET: RequestHandler = async ({ locals }) => {
	const flags = await locals.rpcCaller.flag.getList();

	const resultFlags: Record<string, unknown> = {};
	for (const flag of flags) {
		const flagWithoutKey: PersistentFlag & { key?: string } = { ...flag };
		delete flagWithoutKey.key;
		resultFlags[flag.key] = flagWithoutKey;
	}

	return createJsonResponse({
		flags: resultFlags
	});
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const flagData = schemaPOST.safeParse(await request.json());
	if (!flagData.success)
		return error(400, `Invalid request body: ${zodFlattenError(flagData.error.issues)}`);

	await locals.rpcCaller.flag.create({ key: flagData.data.key, flag: flagData.data });

	return createJsonResponse({
		success: true
	});
};

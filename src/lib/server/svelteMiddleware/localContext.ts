import type { Handle } from '@sveltejs/kit';

import { createServerRpcCaller } from '$lib/rpc/serverRpcCaller';

import { createRequestContext } from '../requestContext';

export const createLocalContextHandle: Handle = async ({ event, resolve }) => {
	const requestContext = await createRequestContext(event.request);

	event.locals = {
		...requestContext,
		rpcCaller: createServerRpcCaller(requestContext)
	};

	return resolve(event);
};

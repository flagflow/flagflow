import type { Handle } from '@sveltejs/kit';

import { createServerApiCaller } from '$lib/api/serverApiCaller';

import { createRequestContext } from '../requestContext';

export const createLocalContextHandle: Handle = async ({ event, resolve }) => {
	const requestContext = await createRequestContext(event.request);

	event.locals = {
		...requestContext,
		apiCaller: createServerApiCaller(requestContext)
	};

	return resolve(event);
};

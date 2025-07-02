import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { building } from '$app/environment';
import { URI_API } from '$lib/api/client';
import { createContext } from '$lib/api/context';
import { router } from '$lib/api/router';
import { createTRPCHandle } from '$lib/api/server';
import { doneContainer } from '$lib/server/container';
import { createLocalContextHandle } from '$lib/server/svelteMiddleware/localContext';
import { createMetricsHandle } from '$lib/server/svelteMiddleware/metrics';
import { createUrlErrorHandle, createUrlLogHandle } from '$lib/server/svelteMiddleware/urlLog';

if (!building) {
	const stop = async () => {
		try {
			await doneContainer();
			// eslint-disable-next-line unicorn/no-process-exit
			process.exit();
		} catch {
			// eslint-disable-next-line unicorn/no-process-exit
			process.exit(1);
		}
	};
	process.on('SIGINT', stop); // CTRL+C
	process.on('SIGTERM', stop); // Docker stop
}

export const handle: Handle = sequence(
	createTRPCHandle(router, URI_API, createContext),

	createLocalContextHandle,
	createUrlLogHandle,
	createMetricsHandle
);

export const handleError: HandleServerError = createUrlErrorHandle;

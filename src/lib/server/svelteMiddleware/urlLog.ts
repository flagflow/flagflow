import { error as svelteKitError, type Handle, type HandleServerError } from '@sveltejs/kit';

import { URI_RPC } from '$lib/rpc/client';

import { createLogger } from '../log';
import { createCounter, METRICS_ENABLED, URI_METRICS } from './metrics';

const metricUrl = METRICS_ENABLED
	? createCounter({
			name: 'uri',
			help: 'URI call',
			labelNames: ['method', 'path', 'status']
		})
	: undefined;

const isInternalUrl = (url: URL) =>
	url.pathname.startsWith(URI_RPC) || url.pathname.startsWith('/health');

export const createUrlLogHandle: Handle = async ({ event, resolve }) => {
	const logService = event.locals.container.resolve('logService');
	const logHttp = logService('http');
	const url = new URL(event.request.url);

	const metaRequest = { method: event.request.method, path: url.pathname };

	if (!isInternalUrl(url)) logHttp.debug(metaRequest, 'Request');

	const start = Date.now();
	const response = await resolve(event);
	const elapsedMs = Date.now() - start;

	if (isInternalUrl(url)) return response;

	const metaResponse = { ...metaRequest, elapsed: elapsedMs };
	if (response.ok) logHttp.debug(metaResponse, 'Response');

	if (!url.pathname.startsWith(URI_METRICS))
		metricUrl?.inc(
			{ method: event.request.method, path: url.pathname, status: response.status },
			1
		);

	return response;
};

export const createUrlErrorHandle: HandleServerError = async ({
	event,
	status,
	message,
	error
}) => {
	const logService = event.locals.container?.resolve('logService')('http') || createLogger('http');

	const url = new URL(event.request.url);
	const meta = { method: event.request.method, path: url.pathname };
	logService?.error(
		{
			...meta,
			internal: error instanceof Error ? error.message : error,
			status: status
		},
		message
	);

	if (status === 500)
		return svelteKitError(500, error instanceof Error ? error.message : 'Internal error');
};

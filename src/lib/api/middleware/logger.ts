import type { AnyTRPCMiddlewareFunction } from '@trpc/server';

import { createCounter, METRICS_ENABLED } from '$lib/server/svelteMiddleware/metrics';

const metricApi = METRICS_ENABLED
	? createCounter({
			name: 'api',
			help: 'API call',
			labelNames: ['method', 'path', 'error']
		})
	: undefined;

export const logMiddleware: AnyTRPCMiddlewareFunction = async ({ type, path, ctx, next }) => {
	const logService = ctx.container.resolve('logService')('api');
	const configService = ctx.container.resolve('configService');

	const metaRequest = { method: type, path };
	logService.debug(metaRequest, 'Request');

	const start = Date.now();
	if (configService.dev.apiSlowdownMs)
		await new Promise((r) => setTimeout(r, configService.dev.apiSlowdownMs));
	const result = await next();
	const elapsedMs = Date.now() - start;

	const metaResponse = { ...metaRequest, elapsed: elapsedMs };
	if (result.ok) {
		logService.debug(metaResponse, 'Response');
		metricApi?.inc({ method: type, path });
	} else {
		logService.error(
			{
				...metaResponse,
				error: {
					name: result.error.name,
					code: result.error.code === result.error.message ? undefined : result.error.code,
					message: result.error.message
				}
			},
			result.error.message
		);
		metricApi?.inc({ method: type, path, error: result.error.code });
	}
	return result;
};

import type { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import';

import { createCounter, METRICS_ENABLED } from '$lib/server/svelteMiddleware/metrics';

import type { Context } from '../context';
import type { Meta } from '../meta';

const metricRpc = METRICS_ENABLED
	? createCounter({
			name: 'rpc',
			help: 'RPC call',
			labelNames: ['method', 'path', 'error']
		})
	: undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logMiddleware: MiddlewareFunction<Context, Meta, void, void, any> = async ({
	type,
	path,
	ctx,
	next
}) => {
	const logService = ctx.container.resolve('logService')('rpc');
	const configService = ctx.container.resolve('configService');

	const metaRequest = { method: type, path };
	logService.debug(metaRequest, 'Request');

	const start = Date.now();
	if (configService.dev.rpcSlowdownMs)
		await new Promise((r) => setTimeout(r, configService.dev.rpcSlowdownMs));
	const result = await next();
	const elapsedMs = Date.now() - start;

	const metaResponse = { ...metaRequest, elapsed: elapsedMs };
	if (result.ok) {
		logService.debug(metaResponse, 'Response');
		metricRpc?.inc({ method: type, path });
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
		metricRpc?.inc({ method: type, path, error: result.error.code });
	}
	return result;
};

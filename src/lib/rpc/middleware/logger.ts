import type { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import';

import { logAudit, type LogAuditObject } from '$lib/server/logAudit';
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
	const configService = ctx.container.resolve('configService');
	const logService = ctx.container.resolve('logService');
	const logRpc = logService('rpc');
	const auditObject: LogAuditObject = {
		subject: `${type}:${path}`,
		auth: {
			method: ctx.authentication.type
		}
	};
	if (ctx.authentication.success && auditObject.auth)
		auditObject.auth.user = {
			username: ctx.authentication.success.userName,
			permissions: ctx.authentication.success.permissions || []
		};

	const metaRequest = { method: type, path };
	logRpc.debug(metaRequest, 'Request');

	const start = Date.now();
	if (configService.dev.rpcSlowdownMs)
		await new Promise((r) => setTimeout(r, configService.dev.rpcSlowdownMs));
	const result = await next();
	const elapsedMs = Date.now() - start;
	auditObject.performance = { duration: elapsedMs };

	const metaResponse = { ...metaRequest, elapsed: elapsedMs };
	if (result.ok) {
		logRpc.debug(metaResponse, 'Response');
		auditObject.response = { data: result.data };
		metricRpc?.inc({ method: type, path });
	} else {
		logRpc.error(
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
		auditObject.response = { errorMessage: result.error.message };
		metricRpc?.inc({ method: type, path, error: result.error.code });
	}

	logAudit(configService, logService('rpc'), auditObject);

	return result;
};

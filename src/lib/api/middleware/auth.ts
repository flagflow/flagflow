import { TRPCError } from '@trpc/server';
import type { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import';

import type { Context } from '../context';
import type { Meta } from '../meta';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware: MiddlewareFunction<Context, Meta, any, any, any> = async ({
	ctx,
	next,
	meta
}) => {
	if (!ctx.authentication.success)
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication error' });
	if (meta?.permission)
		switch (ctx.authentication.type) {
			case 'JWT':
				if (!ctx.authentication.authentication.roles.includes(meta.permission))
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: `Permission error (${meta.permission})`
					});
				break;
			case 'SESSION':
				if (!ctx.authentication.authentication.roles.includes(meta.permission))
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: `Permission error (${meta.permission})`
					});
				break;
			case 'NONE':
				throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication error' });
			default:
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Unknown authentication type'
				});
		}
	return await next();
};

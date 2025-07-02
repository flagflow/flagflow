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
	if (!ctx.jwtTokens.authentication)
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication error' });
	if (meta?.permission && !ctx.jwtTokens.authentication.roles.includes(meta.permission))
		throw new TRPCError({ code: 'FORBIDDEN', message: `Permission error (${meta.permission})` });
	return await next();
};

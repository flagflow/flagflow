import { TRPCError } from '@trpc/server';
import type { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import';

import type { Context } from '../context';
import type { Meta } from '../meta';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware: MiddlewareFunction<Context, Meta, void, void, any> = async ({
	ctx,
	next,
	meta
}) => {
	if (!ctx.authentication.success)
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication error' });

	// Check for expired password - only allow RPCs marked as allowPasswordExpired when password is expired
	if (
		ctx.authentication.type === 'SESSION' &&
		ctx.authentication.success.passwordExpired &&
		!meta?.allowPasswordExpired
	)
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Password expired - please change your password'
		});

	if (meta?.permission !== undefined)
		switch (ctx.authentication.type) {
			case 'JWT':
				if (!ctx.authentication.success.permissions.includes(meta.permission))
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: `Permission error (${meta.permission})`
					});
				break;
			case 'SESSION':
				if (!ctx.authentication.success.permissions.includes(meta.permission))
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: `Permission error (${meta.permission})`
					});
				break;
			default:
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Unknown authentication type'
				});
		}
	return await next();
};

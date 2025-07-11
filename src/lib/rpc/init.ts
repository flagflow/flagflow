import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import type { Context } from './context';
import type { Meta } from './meta';
import { authMiddleware } from './middleware/auth';
import { logMiddleware } from './middleware/logger';
import type { RpcRouter } from './router';

const t = initTRPC
	.context<Context>()
	.meta<Meta>()
	.create({
		transformer: superjson,
		errorFormatter: ({ shape, error }) => {
			if (error.cause instanceof ZodError)
				return {
					...shape,
					message: error.cause.message
				};
			return shape;
		}
	});

export const createRpcRouter = t.router;
export const mergeRpcRouters = t.mergeRouters;
export const createRpcCallerFactory = t.createCallerFactory;

export type RpcLocalCaller = ReturnType<
	ReturnType<typeof createRpcCallerFactory<RpcRouter['_def']['procedures']>>
>;

export const publicRpcProcedure = t.procedure.use<Context>(logMiddleware);
export const rpcProcedure = publicRpcProcedure.use<Context>(authMiddleware);

import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { zodFlattenError } from '$lib/zodEx';

import type { Context } from './context';
import type { Meta } from './meta';
import { authMiddleware } from './middleware/auth';
import { logMiddleware } from './middleware/logger';
import type { Router } from './router';

const t = initTRPC
	.context<Context>()
	.meta<Meta>()
	.create({
		transformer: superjson,
		errorFormatter: ({ shape, error }) => {
			if (error.cause instanceof ZodError)
				return {
					...shape,
					message: zodFlattenError(error.cause.errors)
				};
			if (error.cause?.message.includes('ECONNREFUSED') && error.cause?.message.includes('5432'))
				return {
					...shape,
					message: 'Database unavailable error'
				};
			return shape;
		}
	});

export const createApiRouter = t.router;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;

export type ApiLocalCaller = ReturnType<
	ReturnType<typeof createCallerFactory<Router['_def']['procedures']>>
>;

export const publicApiProcedure = t.procedure.use<Context>(logMiddleware);
export const apiProcedure = publicApiProcedure.use<Context>(authMiddleware);

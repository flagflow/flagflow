import type { CreateRequestContext } from '$lib/server/requestContext';

import { createCallerFactory } from './init';
import { router } from './router';

export const createServerApiCaller = (requestContext: CreateRequestContext) =>
	createCallerFactory(router)(requestContext);

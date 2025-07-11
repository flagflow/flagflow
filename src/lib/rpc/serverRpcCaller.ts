import type { CreateRequestContext } from '$lib/server/requestContext';

import { createRpcCallerFactory } from './init';
import { router } from './router';

export const createServerRpcCaller = (requestContext: CreateRequestContext) =>
	createRpcCallerFactory(router)(requestContext);

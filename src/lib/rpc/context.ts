import type { RequestEvent } from '@sveltejs/kit';

import { createRequestContext } from '$lib/server/requestContext';

export const createContext = async (event: RequestEvent) => createRequestContext(event.request);
export type Context = Awaited<ReturnType<typeof createContext>>;

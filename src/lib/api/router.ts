import { rootProtectedApi } from '$api/protected';
import { rootPublicApi } from '$api/public';

import { mergeRouters } from './init';

export const router = mergeRouters(rootPublicApi, rootProtectedApi);
export type Router = typeof router;

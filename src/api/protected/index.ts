import { createApiRouter } from '$lib/api/init';

import { sessionApi } from './session';

export const rootProtectedApi = createApiRouter({
	session: sessionApi
});

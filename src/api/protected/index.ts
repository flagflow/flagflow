import { createApiRouter } from '$lib/api/init';

import { sessionApi } from './session';
import { userApi } from './user';

export const rootProtectedApi = createApiRouter({
	session: sessionApi,
	user: userApi
});

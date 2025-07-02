import { createApiRouter } from '$lib/api/init';

import { loginApi } from './login';

export const rootPublicApi = createApiRouter({
	login: loginApi
});

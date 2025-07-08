import { createRpcRouter } from '$lib/rpc/init';

import { loginRpc } from './login';

export const rootPublicRpc = createRpcRouter({
	login: loginRpc
});

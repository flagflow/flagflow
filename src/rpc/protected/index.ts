import { createRpcRouter } from '$lib/rpc/init';

import { sessionRpc } from './session';
import { userRpc } from './user';

export const rootProtectedRpc = createRpcRouter({
	session: sessionRpc,
	user: userRpc
});

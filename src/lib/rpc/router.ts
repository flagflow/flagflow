import { rootProtectedRpc } from '$rpc/protected';
import { rootPublicRpc } from '$rpc/public';

import { mergeRpcRouters } from './init';

export const router = mergeRpcRouters(rootPublicRpc, rootProtectedRpc);
export type RpcRouter = typeof router;

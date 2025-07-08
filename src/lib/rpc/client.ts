import { createTRPCClient, httpBatchLink, TRPCClientError, type TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import superjson from 'superjson';

import { goto } from '$app/navigation';
import { isTrpcCommunication } from '$lib/navigationEx';

import type { RpcRouter } from './router';

export const URI_RPC = '/ui-rpc';

const URI_LOGVISITEDPAGES = 'logVisitedPages';

export const errorAndCommunicationObserverLink: TRPCLink<RpcRouter> =
	() =>
	// eslint-disable-next-line unicorn/consistent-function-scoping
	({ next, op }) =>
		observable((observer) => {
			if (!op.path.includes(URI_LOGVISITEDPAGES)) isTrpcCommunication.set(true);
			next(op).subscribe({
				next: (value) => observer.next(value),
				complete: () => {
					if (!op.path.includes(URI_LOGVISITEDPAGES)) isTrpcCommunication.set(false);
					observer.complete();
				},
				error: async (error) => {
					if (!op.path.includes(URI_LOGVISITEDPAGES)) isTrpcCommunication.set(false);
					if (error instanceof TRPCClientError && error.message.includes('Authentication error'))
						await goto('/', { invalidateAll: true });
					else observer.error(error);
				}
			});
		});

export const rpcClient = createTRPCClient<RpcRouter>({
	links: [
		errorAndCommunicationObserverLink,
		httpBatchLink({
			url: URI_RPC,
			transformer: superjson
		})
	]
});

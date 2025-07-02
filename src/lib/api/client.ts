import { createTRPCClient, httpBatchLink, TRPCClientError, type TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import superjson from 'superjson';

import { goto } from '$app/navigation';
import { isTrpcCommunication } from '$lib/navigationEx';

import type { Router } from './router';

export const URI_API = '/api';

const URI_LOGVISITEDPAGES = 'logVisitedPages';

export const errorAndCommunicationObserverLink: TRPCLink<Router> =
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

export const apiClient = createTRPCClient<Router>({
	links: [
		errorAndCommunicationObserverLink,
		httpBatchLink({
			url: URI_API,
			transformer: superjson
		})
	]
});

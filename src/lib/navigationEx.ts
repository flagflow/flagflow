import { writable } from 'svelte/store';

import { invalidateAll } from '$app/navigation';

import { debouncedStore } from './storeEx';

export const isInvalidating = writable(false);

export const invalidatePage = async () => {
	isInvalidating.set(true);
	try {
		await invalidateAll();
	} finally {
		isInvalidating.set(false);
	}
};

export const isTrpcCommunication = writable(false);
export const isDebouncedTrpcCommunication = debouncedStore(isTrpcCommunication, 100);

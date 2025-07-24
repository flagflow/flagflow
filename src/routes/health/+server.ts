import { createJsonResponse } from '$lib/Response';
import { verifyKeycloakCommunication } from '$lib/server/keycloak';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const etcdService = event.locals.container.resolve('etcdService');

	let etcdVersion: string | undefined;
	try {
		etcdVersion = (await etcdService.status()).version;
	} catch {
		etcdVersion = undefined;
	}

	let keycloakError: string | undefined;
	try {
		await verifyKeycloakCommunication();
	} catch (error) {
		keycloakError =
			error instanceof AggregateError
				? error.errors.map((error_) => error_.message).join(', ')
				: error instanceof Error
					? error.message
					: 'Unknown error';
	}

	return createJsonResponse(
		{
			etcd: etcdVersion
				? {
						version: etcdVersion,
						status: 'OK'
					}
				: {
						version: 'unknown',
						status: 'ERROR'
					},
			keycloak: keycloakError
				? {
						status: 'ERROR',
						message: keycloakError
					}
				: {
						status: 'OK'
					}
		},
		etcdVersion && !keycloakError ? 200 : 500
	);
};

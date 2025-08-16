import { createJsonResponse } from '$lib/Response';
import { verifyKeycloakCommunication } from '$lib/server/keycloak';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const configService = event.locals.container.resolve('configService');
	const persistentService = event.locals.container.resolve('persistentService');

	let persistenceStatus: string | undefined;
	try {
		persistenceStatus = await persistentService.status();
	} catch {
		persistenceStatus = undefined;
	}

	let keycloakStatus: 'OK' | 'ERROR' | 'NOTUSED' = 'NOTUSED';
	let keycloakError: string | undefined;
	try {
		if (configService.keycloak.host) {
			await verifyKeycloakCommunication();
			keycloakStatus = 'OK';
		}
	} catch (error) {
		keycloakStatus = 'ERROR';
		keycloakError =
			error instanceof AggregateError
				? error.errors.map((error_) => error_.message).join(', ')
				: error instanceof Error
					? error.message
					: 'Unknown error';
	}

	return createJsonResponse(
		{
			persistence: persistenceStatus
				? {
						status: persistenceStatus
					}
				: {
						status: 'ERROR'
					},
			keycloak:
				keycloakStatus === 'ERROR'
					? {
							status: 'ERROR',
							message: keycloakError
						}
					: keycloakStatus === 'NOTUSED'
						? {
								status: 'NOTUSED'
							}
						: {
								status: 'OK'
							}
		},
		{ status: persistenceStatus && !keycloakError ? 200 : 500 }
	);
};

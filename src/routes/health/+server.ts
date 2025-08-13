import { createJsonResponse } from '$lib/Response';
import { verifyKeycloakCommunication } from '$lib/server/keycloak';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const configService = event.locals.container.resolve('configService');
	const etcdService = event.locals.container.resolve('etcdService');

	let etcdVersion: string | undefined;
	try {
		etcdVersion = (await etcdService.status()).version;
	} catch {
		etcdVersion = undefined;
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
			etcd: etcdVersion
				? {
						version: etcdVersion,
						status: 'OK'
					}
				: {
						version: 'unknown',
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
		{ status: etcdVersion && !keycloakError ? 200 : 500 }
	);
};

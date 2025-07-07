import { verifyKeycloakCommunication } from '$lib/server/keycloak';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const etcdService = event.locals.container.resolve('etcdService');

	let ectdVersion: string | undefined;
	try {
		ectdVersion = (await etcdService.status()).version;
	} catch {
		ectdVersion = undefined;
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

	return new Response(
		JSON.stringify({
			etcd: ectdVersion
				? {
						version: ectdVersion,
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
		}),
		{ status: ectdVersion && !keycloakError ? 200 : 500 }
	);
};

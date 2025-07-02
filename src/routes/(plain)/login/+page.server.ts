import { keycloakUrls } from '$lib/server/keycloak';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const url = new URL(request.url);
	const host = `${url.protocol}//${url.host}`;

	return {
		keycloak: {
			enabled: keycloakUrls.enabled,
			loginUrl: keycloakUrls.loginUrl(host)
		}
	};
};

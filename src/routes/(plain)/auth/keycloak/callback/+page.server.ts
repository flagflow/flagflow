import { accessKeycloakTokens, verifyKeycloakAccessToken } from '$lib/server/keycloak';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const url = new URL(request.url);
	const host = `${url.protocol}//${url.host}`;

	const error = url.searchParams.get('error');
	if (error) throw new Error(`Keycloak error: ${error}`);

	const code = url.searchParams.get('code');
	if (!code) throw new Error('Keycloak error: no code provided');

	const tokens = await accessKeycloakTokens(host, code);
	const accesToken = await verifyKeycloakAccessToken(tokens.access_token);

	return {
		tokens,
		accesToken
	};
};

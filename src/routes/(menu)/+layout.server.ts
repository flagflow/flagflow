import { redirect } from '@sveltejs/kit';

import { keycloakUrls } from '$lib/server/keycloak';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, locals: { jwtTokens } }) => {
	if (!jwtTokens.authentication) throw redirect(302, '/login');

	const url = new URL(request.url);
	const host = `${url.protocol}//${url.host}`;

	return {
		authentication: jwtTokens.authentication,
		logoutUrl: keycloakUrls.logoutUrl(host, jwtTokens.id_token)
	};
};

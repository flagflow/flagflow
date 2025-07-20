import { redirect } from '@sveltejs/kit';

import { keycloakUrls } from '$lib/server/keycloak';
import { UserRoleFromArray } from '$types/UserRoles';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, locals: { authentication } }) => {
	if (!authentication.success) throw redirect(302, '/login');

	const url = new URL(request.url);
	const host = `${url.protocol}//${url.host}`;

	const authenticationContext = {
		type: authentication.type,
		userName: authentication.success.userName,
		roles: UserRoleFromArray(authentication.success.roles),
		jwtExpiredAt: authentication.type === 'JWT' ? authentication.success?.expiredAt : new Date(),
		logoutUrl:
			authentication.type === 'SESSION'
				? '/logout'
				: authentication.type === 'JWT'
					? keycloakUrls.logoutUrl(host, authentication.tokens.id_token)
					: ''
	} as const;

	return {
		authenticationContext
	};
};

import { redirect } from '@sveltejs/kit';

import { keycloakUrls } from '$lib/server/keycloak';
import { safeUrl } from '$lib/urlEx';
import { UserPermissionFromArray } from '$types/UserPermissions';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({
	request,
	locals: { authentication, container }
}) => {
	if (!authentication.success) throw redirect(302, '/login');

	// Check if password is expired for session authentication
	if (authentication.type === 'SESSION' && authentication.success.passwordExpired)
		throw redirect(302, '/password-expired');

	const configService = container.resolve('configService');
	const environmentContext = {
		name: configService.environment,
		usersEnabled: configService.session.enabled
	};

	const url = safeUrl(request.url);
	const host = `${url?.protocol}//${url?.host}`;

	const authenticationContext = {
		type: authentication.type,
		userName: authentication.success.userName,
		permissions: UserPermissionFromArray(authentication.success.permissions),
		passwordExpired:
			authentication.type === 'SESSION' ? authentication.success.passwordExpired : false,
		jwtExpiredAt: authentication.type === 'JWT' ? authentication.success?.expiredAt : new Date(),
		logoutUrl:
			authentication.type === 'SESSION'
				? '/logout'
				: authentication.type === 'JWT'
					? keycloakUrls.logoutUrl(host, authentication.tokens.id_token)
					: ''
	} as const;

	return {
		authenticationContext,
		environmentContext
	};
};

import { redirect } from '@sveltejs/kit';

import { SESSION_COOKIE_NAME } from '$lib/cookies';
import { config } from '$lib/server/config';
import { keycloakUrls } from '$lib/server/keycloak';
import { safeUrl } from '$lib/urlEx';
import { UserPermissionAll } from '$types/UserPermissions';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, locals: { container }, cookies }) => {
	const url = safeUrl(request.url);
	const host = `${url?.protocol}//${url?.host}`;

	if (!config.session.enabled)
		if (keycloakUrls.enabled) {
			const loginUrl = keycloakUrls.loginUrl(host);
			if (loginUrl) return redirect(302, loginUrl);
		} else {
			const sessionService = container.resolve('sessionService');
			const { sessionId } = await sessionService.createSession({
				userKey: 'admin',
				userName: 'Demo User',
				createdAt: new Date(),
				permissions: UserPermissionAll
			});
			cookies.set(SESSION_COOKIE_NAME, sessionId, { path: '/' });
			return redirect(302, '/');
		}

	return {
		keycloak: {
			loginUrl: keycloakUrls.loginUrl(host)
		},
		defaultUser: config.session.defaultUser
	};
};

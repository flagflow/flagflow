import { parse as parseCookie } from 'cookie';

import { JWT_COOKIE_NAMES, SESSION_COOKIE_NAME } from '$lib/cookies';
import { generateTraceId } from '$lib/genId';
import { type JwtTokens } from '$types/Jwt';

import { config } from './config';
import { asValue, container } from './container';
import { verifyKeycloakAccessToken } from './keycloak';

export const createRequestContext = async (request: Request) => {
	const scope = container.createScope();
	scope.register({
		traceId: asValue(generateTraceId())
	});

	let access_token: string | undefined;
	let refresh_token: string | undefined;
	let id_token: string | undefined;
	let sessionId: string | undefined;
	if (request.headers.has('cookie'))
		try {
			const cookie = parseCookie(request.headers.get('cookie')!);
			access_token = cookie[JWT_COOKIE_NAMES.accessToken];
			refresh_token = cookie[JWT_COOKIE_NAMES.refreshToken];
			id_token = cookie[JWT_COOKIE_NAMES.idToken];
			sessionId = cookie[SESSION_COOKIE_NAME];
		} catch {
			access_token = undefined;
			refresh_token = undefined;
			id_token = undefined;
			sessionId = undefined;
		}

	const jwtTokens: JwtTokens = {
		access_token,
		refresh_token,
		id_token
	};
	if (access_token)
		try {
			const accessTokenAuth = await verifyKeycloakAccessToken(access_token);
			jwtTokens.authentication = {
				name: accessTokenAuth.name,
				email: accessTokenAuth.email,
				roles: accessTokenAuth.resource_access[config.keycloak.client]?.roles || [],
				expiredAt: new Date(accessTokenAuth.exp * 1000)
			};
		} catch {
			jwtTokens.authentication = undefined;
		}

	scope.register({
		userName: asValue(jwtTokens.authentication?.name || undefined)
	});

	return {
		container: scope,
		jwtTokens
	};
};
export type CreateRequestContext = Awaited<ReturnType<typeof createRequestContext>>;

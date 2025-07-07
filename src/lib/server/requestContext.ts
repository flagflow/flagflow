/* eslint-disable unicorn/no-useless-undefined */
import { parse as parseCookie } from 'cookie';

import { JWT_COOKIE_NAMES, SESSION_COOKIE_NAME } from '$lib/cookies';
import { generateTraceId } from '$lib/genId';
import type { Authentication } from '$types/Auth';

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

	let authentication: Authentication = {
		type: 'NONE'
	};
	if (access_token)
		try {
			const accessTokenAuth = await verifyKeycloakAccessToken(access_token);
			authentication = {
				type: 'JWT',
				tokens: {
					access_token,
					refresh_token,
					id_token
				},
				success: {
					userName: accessTokenAuth.name,
					email: accessTokenAuth.email,
					roles: accessTokenAuth.resource_access[config.keycloak.client]?.roles || [],
					expiredAt: new Date(accessTokenAuth.exp * 1000)
				}
			};
			scope.register({ userName: asValue(accessTokenAuth.name) });
		} catch {
			authentication = {
				type: 'JWT',
				tokens: {
					access_token,
					refresh_token,
					id_token
				}
			};
			scope.register({ userName: asValue(undefined) });
		}
	else if (sessionId) {
		try {
			const scopeAuth = scope.createScope();
			scopeAuth.register({ userName: asValue(undefined) });
			const sessionService = scopeAuth.resolve('sessionService');
			const session = await sessionService.getSession(sessionId);
			authentication = {
				type: 'SESSION',
				sessionId: sessionId,
				success: session
					? {
							userName: session.userName,
							roles: session.roles
						}
					: undefined
			};
			scope.register({ userName: asValue(session ? session.userName : undefined) });
		} catch {
			authentication = {
				type: 'SESSION',
				sessionId: sessionId
			};
			scope.register({ userName: asValue(undefined) });
		}
	} else scope.register({ userName: asValue(undefined) });

	return {
		container: scope,
		authentication
	};
};
export type CreateRequestContext = Awaited<ReturnType<typeof createRequestContext>>;

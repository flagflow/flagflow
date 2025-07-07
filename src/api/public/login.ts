import { z } from 'zod';

import { ZMinLengthString, ZNonEmptryString } from '$api/zodTypes';
import { createApiRouter, publicApiProcedure } from '$lib/api/init';
import { refreshKeycloakTokens } from '$lib/server/keycloak';

export const loginApi = createApiRouter({
	login: publicApiProcedure
		.input(
			z.object({
				username: ZNonEmptryString(),
				password: ZMinLengthString(8)
			})
		)
		.mutation(async ({ ctx, input: { username, password } }) => {
			const userService = ctx.container.resolve('userService');
			const user = await userService.authUser(username, password);

			const sessionService = ctx.container.resolve('sessionService');
			const sessionId = await sessionService.createSession({
				userName: user?.name || username,
				createdAt: new Date(),
				roles: user?.roles || []
			});

			return { sessionId, userName: user.name };
		}),

	logout: publicApiProcedure.mutation(async () => {
		return {};
	}),

	refreshKeycloakToken: publicApiProcedure.mutation(async ({ ctx: { authentication } }) => {
		if (authentication.type !== 'JWT') throw new Error('Not authenticated with JWT');
		if (!authentication.tokens.refresh_token) throw new Error('No refresh token provided');
		return await refreshKeycloakTokens(authentication.tokens.refresh_token);
	})
});

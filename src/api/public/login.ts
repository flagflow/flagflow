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
				name: user?.name || username,
				roles: user?.roles || []
			});

			return { sessionId, userName: user.name };
		}),

	logout: publicApiProcedure.mutation(async () => {
		return {};
	}),

	refreshKeycloakToken: publicApiProcedure.mutation(async ({ ctx }) => {
		if (!ctx.jwtTokens.refresh_token) throw new Error('No refresh token provided');
		return await refreshKeycloakTokens(ctx.jwtTokens.refresh_token);
	})
});

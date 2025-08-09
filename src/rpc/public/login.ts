import { z } from 'zod';

import { createRpcRouter, publicRpcProcedure } from '$lib/rpc/init';
import { refreshKeycloakTokens } from '$lib/server/keycloak';
import { ZMinLengthString, ZNonEmptyString } from '$rpc/zodTypes';

export const loginRpc = createRpcRouter({
	login: publicRpcProcedure
		.input(
			z.object({
				username: ZNonEmptyString(),
				password: ZMinLengthString(8)
			})
		)
		.mutation(async ({ ctx, input: { username, password } }) => {
			const userService = ctx.container.resolve('userService');
			const user = await userService.authUser(username, password);

			const sessionService = ctx.container.resolve('sessionService');
			const sessionId = await sessionService.createSession({
				userKey: user?.username || username,
				userName: user?.name || username,
				createdAt: new Date(),
				permissions: user?.permissions || []
			});

			return { sessionId, userName: user.name };
		}),

	logout: publicRpcProcedure.mutation(async () => {
		return {};
	}),

	refreshKeycloakToken: publicRpcProcedure.mutation(async ({ ctx: { authentication } }) => {
		if (authentication.type !== 'JWT') throw new Error('Not authenticated with JWT');
		if (!authentication.tokens.refresh_token) throw new Error('No refresh token provided');
		return await refreshKeycloakTokens(authentication.tokens.refresh_token);
	})
});

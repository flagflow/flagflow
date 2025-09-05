import { z } from 'zod';

import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { hashPassword } from '$lib/server/services/coreServices/UserService';
import { ZNonEmptyString } from '$rpc/zodTypes';

export const userSettingRpc = createRpcRouter({
	changePassword: rpcProcedure
		.meta({ allowPasswordExpired: true })
		.input(
			z.object({
				oldPassword: ZNonEmptyString(),
				recentPassword: ZNonEmptyString()
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.authentication.type !== 'SESSION')
				throw new Error('Only session authentication is supported');

			const userName = ctx.authentication.success?.userName;
			if (!userName) throw new Error('Not authenticated');

			const persistentService = ctx.container.resolve('persistentService');
			const user = await persistentService.getOrThrow('user', userName);
			if (user.passwordHash !== hashPassword(input.oldPassword))
				throw new Error('Old password is incorrect');

			await persistentService.overwrite('user', userName, {
				passwordHash: hashPassword(input.recentPassword),
				passwordExpireAt: undefined
			});

			ctx.logger('userSetting').info(`User ${userName} password updated`);
		})
});

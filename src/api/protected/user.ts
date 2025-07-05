import { z } from 'zod';

import { ZNonEmptryString } from '$api/zodTypes';
import { apiProcedure, createApiRouter } from '$lib/api/init';
import { hashPassword } from '$lib/server/services/coreServices/UserService';
import type { EtcdUser } from '$types/Etcd';
import { etcdRecordToArray, EtcdUserKey } from '$types/Etcd';

export const userApi = createApiRouter({
	getList: apiProcedure.query(async ({ ctx }) => {
		const etcdService = ctx.container.resolve('etcdService');
		const usersAsRecord = await etcdService.list('user');
		const users = etcdRecordToArray<EtcdUser>(usersAsRecord);

		return users;
	}),
	create: apiProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				name: z.string().trim(),
				password: ZNonEmptryString(),
				roles: z.array(z.string()),
				mustChangePassword: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.throwIfExists('user', input.key);
			await etcdService.put('user', input.key, {
				name: input.name,
				enabled: true,
				passwordHash: hashPassword(input.password),
				passwordExpireAt: input.mustChangePassword ? Date.now() : undefined,
				roles: input.roles
			});
		}),
	update: apiProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				name: z.string().trim(),
				roles: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.overwrite('user', input.key, {
				name: input.name,
				roles: input.roles
			});
		}),
	setPassword: apiProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				password: ZNonEmptryString(),
				mustChangePassword: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.overwrite('user', input.key, {
				passwordHash: hashPassword(input.password),
				passwordExpireAt: input.mustChangePassword ? Date.now() : undefined
			});
		}),
	setEnabled: apiProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				enabled: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.overwrite('user', input.key, {
				enabled: input.enabled
			});
		}),
	delete: apiProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.throwIfNotExists('user', input.key);
			await etcdService.delete('user', input.key);
		})
});

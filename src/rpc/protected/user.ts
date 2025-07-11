import { z } from 'zod';

import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { hashPassword } from '$lib/server/services/coreServices/UserService';
import { ZNonEmptyString } from '$rpc/zodTypes';
import type { EtcdUser } from '$types/etcd';
import { etcdRecordToArray, EtcdUserKey } from '$types/etcd';
import { type UserRole, UserRoleZodEnum } from '$types/userRoles';

export const userRpc = createRpcRouter({
	getList: rpcProcedure.query(async ({ ctx }) => {
		const etcdService = ctx.container.resolve('etcdService');
		const usersAsRecord = await etcdService.list('user');
		const users = etcdRecordToArray<EtcdUser>(usersAsRecord);

		return users;
	}),
	get: rpcProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim()
			})
		)
		.query(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			const user = await etcdService.getOrThrow('user', input.key);
			return {
				name: user.name,
				enabled: user.enabled,
				roles: user.roles as UserRole[],
				mustChangePassword: !!user.passwordExpireAt && user.passwordExpireAt > Date.now()
			};
		}),
	create: rpcProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				name: z.string().trim(),
				password: ZNonEmptyString(),
				roles: z.array(UserRoleZodEnum),
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
	update: rpcProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				name: z.string().trim(),
				roles: z.array(UserRoleZodEnum)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.overwrite('user', input.key, {
				name: input.name,
				roles: input.roles
			});
		}),
	setPassword: rpcProcedure
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				password: ZNonEmptyString(),
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
	setEnabled: rpcProcedure
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
	delete: rpcProcedure
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

import { z } from 'zod';

import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { hashPassword } from '$lib/server/services/coreServices/UserService';
import { ZNonEmptyString } from '$rpc/zodTypes';
import type { EtcdUser } from '$types/etcd';
import { etcdRecordToArray, EtcdUserKey } from '$types/etcd';
import { type UserPermission, UserPermissionZodEnum } from '$types/UserPermissions';

const rpcProcedureUsersPermission = rpcProcedure.meta({ permission: 'users' });

export const userRpc = createRpcRouter({
	getList: rpcProcedureUsersPermission.query(async ({ ctx }) => {
		const persistentService = ctx.container.resolve('persistentService');
		const { list: usersAsRecord } = await persistentService.list('user');
		const users = etcdRecordToArray<EtcdUser>(usersAsRecord);

		return users;
	}),
	get: rpcProcedure
		.meta({ permission: 'users' })
		.input(
			z.object({
				key: EtcdUserKey.trim()
			})
		)
		.query(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const user = await persistentService.getOrThrow('user', input.key);
			return {
				name: user.name,
				enabled: user.enabled,
				permissions: user.permissions as UserPermission[],
				mustChangePassword: !!user.passwordExpireAt && user.passwordExpireAt > Date.now()
			};
		}),
	create: rpcProcedureUsersPermission
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				name: z.string().trim(),
				password: ZNonEmptyString(),
				permissions: z.array(UserPermissionZodEnum),
				mustChangePassword: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.throwIfExists('user', input.key);
			await persistentService.put('user', input.key, {
				name: input.name,
				enabled: true,
				passwordHash: hashPassword(input.password),
				passwordExpireAt: input.mustChangePassword ? Date.now() : undefined,
				permissions: input.permissions
			});
		}),
	update: rpcProcedureUsersPermission
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				name: z.string().trim(),
				permissions: z.array(UserPermissionZodEnum)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.overwrite('user', input.key, {
				name: input.name,
				permissions: input.permissions
			});
		}),
	setPassword: rpcProcedureUsersPermission
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				password: ZNonEmptyString(),
				mustChangePassword: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.overwrite('user', input.key, {
				passwordHash: hashPassword(input.password),
				passwordExpireAt: input.mustChangePassword ? Date.now() : undefined
			});
		}),
	setEnabled: rpcProcedureUsersPermission
		.input(
			z.object({
				key: EtcdUserKey.trim(),
				enabled: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.overwrite('user', input.key, {
				enabled: input.enabled
			});
		}),
	delete: rpcProcedureUsersPermission
		.input(
			z.object({
				key: EtcdUserKey.trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.throwIfNotExists('user', input.key);
			await persistentService.delete('user', input.key);
		})
});

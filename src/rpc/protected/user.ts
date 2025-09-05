import { z } from 'zod';

import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { hashPassword } from '$lib/server/services/coreServices/UserService';
import { ZNonEmptyString } from '$rpc/zodTypes';
import type { PersistentUser } from '$types/persistent';
import { persistentRecordToArray, PersistentUserKey } from '$types/persistent';
import { type UserPermission, UserPermissionZodEnum } from '$types/UserPermissions';

const rpcProcedureUsersPermission = rpcProcedure.meta({ permission: 'users' });

export const userRpc = createRpcRouter({
	getList: rpcProcedureUsersPermission.query(async ({ ctx }) => {
		const persistentService = ctx.container.resolve('persistentService');
		const { list: usersAsRecord } = await persistentService.list('user');
		const users = persistentRecordToArray<PersistentUser>(usersAsRecord);

		return users;
	}),
	get: rpcProcedure
		.meta({ permission: 'users' })
		.input(
			z.object({
				key: PersistentUserKey.trim()
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
				key: PersistentUserKey.trim(),
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
			ctx.logger('user').info(`User ${input.key} created`);
		}),
	update: rpcProcedureUsersPermission
		.input(
			z.object({
				key: PersistentUserKey.trim(),
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
			ctx.logger('user').info(`User ${input.key} updated`);
		}),
	setPassword: rpcProcedureUsersPermission
		.input(
			z.object({
				key: PersistentUserKey.trim(),
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
			ctx.logger('user').info(`User ${input.key} password updated`);
		}),
	setEnabled: rpcProcedureUsersPermission
		.input(
			z.object({
				key: PersistentUserKey.trim(),
				enabled: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.overwrite('user', input.key, {
				enabled: input.enabled
			});
			ctx.logger('user').info(`User ${input.key} enabled status updated to ${input.enabled}`);
		}),
	delete: rpcProcedureUsersPermission
		.input(
			z.object({
				key: PersistentUserKey.trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.throwIfNotExists('user', input.key);
			await persistentService.delete('user', input.key);
			ctx.logger('user').info(`User ${input.key} deleted`);
		})
});

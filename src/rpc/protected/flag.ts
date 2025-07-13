import { z } from 'zod';

import { updateFlag } from '$lib/flagUpdater';
import { flagSchemaValidator, flagValueValidator } from '$lib/flagValidator';
import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { EtcdFlag } from '$types/etcd';
import { EtcdFlagKey, etcdRecordToArray } from '$types/etcd';

export const flagRpc = createRpcRouter({
	getList: rpcProcedure.query(async ({ ctx }) => {
		const etcdService = ctx.container.resolve('etcdService');
		const flagsAsRecord = await etcdService.list('flag');
		const flags = etcdRecordToArray<EtcdFlag>(flagsAsRecord);

		return flags;
	}),
	get: rpcProcedure
		.input(
			z.object({
				key: EtcdFlagKey.trim()
			})
		)
		.query(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			return await etcdService.getOrThrow('flag', input.key);
		}),
	create: rpcProcedure
		.input(
			z.object({
				key: EtcdFlagKey.trim(),
				flag: EtcdFlag
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.throwIfExists('flag', input.key);

			const schemaError = flagSchemaValidator(input.flag);
			if (schemaError) throw new Error(`Invalid flag schema: ${schemaError}`);
			const valueError = flagValueValidator(input.flag);
			if (valueError) throw new Error(`Invalid flag value: ${valueError}`);

			await etcdService.put('flag', input.key, input.flag);
		}),
	rename: rpcProcedure
		.input(
			z.object({
				oldKey: EtcdFlagKey.trim(),
				recentKey: EtcdFlagKey.trim(),
				description: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			const flag = await etcdService.getOrThrow('flag', input.oldKey);
			flag.description = input.description;

			if (input.oldKey === input.recentKey) await etcdService.put('flag', input.recentKey, flag);
			else {
				await etcdService.throwIfExists('flag', input.recentKey);

				await etcdService.put('flag', input.recentKey, flag);
				await etcdService.delete('flag', input.oldKey);
			}
		}),
	update: rpcProcedure
		.input(
			z.object({
				key: EtcdFlagKey.trim(),
				flag: EtcdFlag
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			const currentFlag = await etcdService.getOrThrow('flag', input.key);

			if (currentFlag.type !== input.flag.type)
				throw new Error(
					`Flag type cannot be changed (current: ${currentFlag.type}, new: ${input.flag.type})`
				);

			await etcdService.overwrite('flag', input.key, updateFlag(currentFlag, input.flag));
		}),
	delete: rpcProcedure
		.input(
			z.object({
				key: EtcdFlagKey.trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			await etcdService.throwIfNotExists('flag', input.key);
			await etcdService.delete('flag', input.key);
		})
});

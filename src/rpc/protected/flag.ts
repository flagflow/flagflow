import { z } from 'zod';

import { updateFlagSchema, updateFlagValue } from '$lib/flagHandler/flagUpdater';
import { flagSchemaValidator, flagValueValidator } from '$lib/flagHandler/flagValidator';
import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { EtcdFlag } from '$types/etcd';
import { EtcdFlagKey, etcdRecordToArray } from '$types/etcd';

export const flagRpc = createRpcRouter({
	getList: rpcProcedure.query(async ({ ctx }) => {
		const flagService = ctx.container.resolve('flagService');
		const flagsAsRecord = await flagService.list();
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
		.meta({ permission: 'maintainer' })
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
		.meta({ permission: 'maintainer' })
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
	updateSchema: rpcProcedure
		.meta({ permission: 'maintainer' })
		.input(
			z.object({
				key: EtcdFlagKey.trim(),
				flag: EtcdFlag,
				resetValue: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			const currentFlag = await etcdService.getOrThrow('flag', input.key);

			if (currentFlag.type !== input.flag.type)
				throw new Error(
					`Flag type cannot be changed (current: ${currentFlag.type}, new: ${input.flag.type})`
				);

			const recentFlag = updateFlagSchema(currentFlag, input.flag);
			const schemaError = flagSchemaValidator(recentFlag);
			if (schemaError) throw new Error(`Invalid flag schema: ${schemaError}`);

			if ('valueExists' in recentFlag && 'valueExists' in input.flag) {
				if (input.resetValue) {
					recentFlag.valueExists = false;
					recentFlag.value = recentFlag.defaultValue;
				} else {
					if (
						input.flag.valueExists &&
						(recentFlag.value !== input.flag.value ||
							recentFlag.valueExists !== input.flag.valueExists) &&
						!ctx.authentication.success?.roles.includes('editor')
					)
						throw new Error('You do not have permission to update flag value');
					recentFlag.valueExists = input.flag.valueExists;
					recentFlag.value = input.flag.value;
				}
			}
			const valueError = flagValueValidator(recentFlag);
			if (valueError) throw new Error(`Invalid flag value: ${valueError}`);

			await etcdService.overwrite('flag', input.key, recentFlag);
		}),
	updateValue: rpcProcedure
		.meta({ permission: 'editor' })
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
			if (!('valueExists' in input.flag))
				throw new Error('Flag with dynamic value cannot be updated');

			const schemaError = flagSchemaValidator(currentFlag);
			if (schemaError) throw new Error(`Invalid flag schema: ${schemaError}`);

			const recentFlag = updateFlagValue(currentFlag, input.flag);

			const valueError = flagValueValidator(recentFlag);
			if (valueError) throw new Error(`Invalid flag value: ${valueError}`);

			await etcdService.overwrite('flag', input.key, recentFlag);
		}),
	delete: rpcProcedure
		.meta({ permission: 'maintainer' })
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

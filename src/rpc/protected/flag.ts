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
			const persistentService = ctx.container.resolve('persistentService');
			return await persistentService.getOrThrow('flag', input.key);
		}),
	create: rpcProcedure
		.meta({ permission: 'flag-create' })
		.input(
			z.object({
				key: EtcdFlagKey.trim(),
				flag: EtcdFlag
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.throwIfExists('flag', input.key);

			const schemaError = flagSchemaValidator(input.flag);
			if (schemaError) throw new Error(`Invalid flag schema: ${schemaError}`);
			const valueError = flagValueValidator(input.flag);
			if (valueError) throw new Error(`Invalid flag value: ${valueError}`);

			await persistentService.put('flag', input.key, input.flag);
		}),
	rename: rpcProcedure
		.meta({ permission: 'flag-create' })
		.input(
			z.object({
				oldKey: EtcdFlagKey.trim(),
				recentKey: EtcdFlagKey.trim(),
				description: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const flag = await persistentService.getOrThrow('flag', input.oldKey);
			flag.description = input.description;

			if (input.oldKey === input.recentKey)
				await persistentService.put('flag', input.recentKey, flag);
			else {
				await persistentService.throwIfExists('flag', input.recentKey);

				await persistentService.put('flag', input.recentKey, flag);
				await persistentService.delete('flag', input.oldKey);
			}
		}),
	updateSchema: rpcProcedure
		.meta({ permission: 'flag-schema' })
		.input(
			z.object({
				key: EtcdFlagKey.trim(),
				flag: EtcdFlag,
				resetValue: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const currentFlag = await persistentService.getOrThrow('flag', input.key);

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
						!ctx.authentication.success?.permissions.includes('flag-value')
					)
						throw new Error('You do not have permission to update flag value');
					recentFlag.valueExists = input.flag.valueExists;
					recentFlag.value = input.flag.value;
				}
			}
			const valueError = flagValueValidator(recentFlag);
			if (valueError) throw new Error(`Invalid flag value: ${valueError}`);

			await persistentService.overwrite('flag', input.key, recentFlag);
		}),
	updateValue: rpcProcedure
		.meta({ permission: 'flag-value' })
		.input(
			z.object({
				key: EtcdFlagKey.trim(),
				flag: EtcdFlag
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const currentFlag = await persistentService.getOrThrow('flag', input.key);

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

			await persistentService.overwrite('flag', input.key, recentFlag);
		}),
	updateKillSwitch: rpcProcedure
		.meta({ permission: 'flag-value' })
		.input(
			z.object({
				key: EtcdFlagKey.trim(),
				value: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const currentFlag = await persistentService.getOrThrow('flag', input.key);

			if (currentFlag.type !== 'BOOLEAN' || !currentFlag.isKillSwitch)
				throw new Error(`Flag type must be BOOLEAN and a kill switch`);

			currentFlag.valueExists = true;
			currentFlag.value = input.value;

			const valueError = flagValueValidator(currentFlag);
			if (valueError) throw new Error(`Invalid flag value: ${valueError}`);

			await persistentService.overwrite('flag', input.key, currentFlag);
		}),
	delete: rpcProcedure
		.meta({ permission: 'flag-create' })
		.input(
			z.object({
				key: EtcdFlagKey.trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.throwIfNotExists('flag', input.key);
			await persistentService.delete('flag', input.key);
		})
});

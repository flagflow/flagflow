import { z } from 'zod';

import { updateFlagSchema, updateFlagValue } from '$lib/flagHandler/flagUpdater';
import { flagSchemaValidator, flagValueValidator } from '$lib/flagHandler/flagValidator';
import { basename, dirname } from '$lib/pathEx';
import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { PersistentFlag } from '$types/persistent';
import { PersistentFlagKey, persistentRecordToArray } from '$types/persistent';

export const flagRpc = createRpcRouter({
	getList: rpcProcedure.query(async ({ ctx }) => {
		const flagService = ctx.container.resolve('flagService');
		const flagsAsRecord = await flagService.list();
		const flags = persistentRecordToArray<PersistentFlag>(flagsAsRecord);

		return flags;
	}),
	get: rpcProcedure
		.input(
			z.object({
				key: PersistentFlagKey.trim()
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
				key: PersistentFlagKey.trim(),
				flag: PersistentFlag
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

			ctx.logger('flag').info(`Flag created: ${input.key}`);
		}),
	rename: rpcProcedure
		.meta({ permission: 'flag-create' })
		.input(
			z.object({
				oldKey: PersistentFlagKey.trim(),
				recentKey: PersistentFlagKey.trim(),
				description: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const flag = await persistentService.getOrThrow('flag', input.oldKey);
			flag.description = input.description;

			if (input.oldKey === input.recentKey) {
				await persistentService.put('flag', input.recentKey, flag);
				ctx.logger('flag').info(`Flag ${input.oldKey} updated`);
			} else {
				await persistentService.throwIfExists('flag', input.recentKey);

				await persistentService.put('flag', input.recentKey, flag);
				await persistentService.delete('flag', input.oldKey);
				ctx.logger('flag').info(`Flag renamed: ${input.oldKey} -> ${input.recentKey}`);
			}
		}),
	updateSchema: rpcProcedure
		.meta({ permission: 'flag-schema' })
		.input(
			z.object({
				key: PersistentFlagKey.trim(),
				flag: PersistentFlag,
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

			ctx.logger('flag').info(`Flag ${input.key} schema updated`);
		}),
	updateValue: rpcProcedure
		.meta({ permission: 'flag-value' })
		.input(
			z.object({
				key: PersistentFlagKey.trim(),
				flag: PersistentFlag
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

			ctx.logger('flag').info(`Flag ${input.key} value updated`);
		}),
	updateKillSwitch: rpcProcedure
		.meta({ permission: 'flag-value' })
		.input(
			z.object({
				key: PersistentFlagKey.trim(),
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

			ctx.logger('flag').info(`Kill switch ${input.key} updated`);
		}),
	delete: rpcProcedure
		.meta({ permission: 'flag-create' })
		.input(
			z.object({
				key: PersistentFlagKey.trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			await persistentService.throwIfNotExists('flag', input.key);
			await persistentService.delete('flag', input.key);

			ctx.logger('flag').info(`Flag ${input.key} deleted`);
		}),
	renameGroup: rpcProcedure
		.meta({ permission: 'flag-create' })
		.input(
			z.object({
				oldGroupName: z.string().trim(),
				recentGroupName: z.string().trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const { list: flags } = await persistentService.list('flag');

			if (input.oldGroupName === input.recentGroupName)
				throw new Error('Group names must be different');

			const renameMap: Map<string, string> = new Map();
			for (const key of Object.keys(flags)) {
				const groupName = dirname(key);
				const flagName = basename(key);
				if (groupName === input.oldGroupName)
					renameMap.set(key, (input.recentGroupName ? input.recentGroupName + '/' : '') + flagName);
			}

			for (const recentName of renameMap.values())
				await persistentService.throwIfExists('flag', recentName);

			for (const [oldName, recentName] of renameMap.entries()) {
				const flag = await persistentService.getOrThrow('flag', oldName);
				await persistentService.put('flag', recentName, flag);
				await persistentService.delete('flag', oldName);
			}

			ctx
				.logger('flag')
				.info(`Flag group renamed: ${input.oldGroupName} -> ${input.recentGroupName}`);
		}),
	deleteGroup: rpcProcedure
		.meta({ permission: 'flag-create' })
		.input(
			z.object({
				groupName: z.string().trim()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const persistentService = ctx.container.resolve('persistentService');
			const { list: flags } = await persistentService.list('flag');

			const deleteSet: Set<string> = new Set();
			for (const key of Object.keys(flags)) {
				const groupName = dirname(key);
				if (groupName === input.groupName) deleteSet.add(key);
			}

			for (const flagName of deleteSet.keys()) await persistentService.delete('flag', flagName);

			ctx.logger('flag').info(`Flag group deleted: ${input.groupName}`);
		})
});

import { z } from 'zod';

import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import { MigrationFile, MigrationStep, MigrationSummary } from '$types/Migration';

export const migrationRpc = createRpcRouter({
	prepareFromFile: rpcProcedure
		.meta({ permission: 'admin' })
		.input(
			z.object({
				mode: z.enum(['restore', 'migration']),
				migration: MigrationFile
			})
		)
		.output(MigrationSummary)
		.query(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			const user = await etcdService.getOrThrow('user', '1');
			return {
				environment: input.migration.environment,
				version: input.migration.version,
				createdAt: input.migration.createdAt,
				steps: [],
				createdBy: user.name
			};
		}),
	prepareFromRemoteUrl: rpcProcedure
		.meta({ permission: 'admin' })
		.output(MigrationSummary)
		.query(async ({ ctx }) => {
			const etcdService = ctx.container.resolve('etcdService');
			const user = await etcdService.getOrThrow('user', '1');
			return {
				environment: 'a',
				version: 'b',
				createdAt: 'c',
				steps: [],
				createdBy: user.name
			};
		}),
	execute: rpcProcedure
		.meta({ permission: 'admin' })
		.input(
			z.object({
				steps: z.array(MigrationStep)
			})
		)
		.query(async ({ ctx, input }) => {
			const etcdService = ctx.container.resolve('etcdService');
			const user = await etcdService.getOrThrow('user', '1');
			return {
				name: input.steps.length.toString() + user.name
			};
		})
});

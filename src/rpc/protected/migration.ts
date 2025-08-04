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
			const configService = ctx.container.resolve('configService');
			if (input.mode === 'restore' && configService.environment !== input.migration.environment)
				throw new Error(
					`Cannot restore migration for environment "${input.migration.environment}" when current environment is "${configService.environment}"`
				);
			if (input.mode === 'migration' && configService.environment === input.migration.environment)
				throw new Error(`Cannot migrate to the same environment "${input.migration.environment}"`);

			const flagService = ctx.container.resolve('flagService');
			return await flagService.prepareMigration(input.migration);
		}),
	prepareFromRemoteUrl: rpcProcedure
		.meta({ permission: 'admin' })
		.output(MigrationSummary)
		.query(async ({ ctx }) => {
			const configService = ctx.container.resolve('configService');
			if (!configService.migration.sourceUrl) throw new Error(`Missing migration remote URL`);

			const httpClient = ctx.container.resolve('httpClientService').createClient();
			const response = await httpClient.get(configService.migration.sourceUrl);
			const migrationData = MigrationFile.safeParse(response.data);
			if (migrationData.error) throw new Error(`Invalid remote migration file`);

			if (configService.environment === migrationData.data.environment)
				throw new Error(
					`Cannot migrate to the same environment "${migrationData.data.environment}"`
				);

			const flagService = ctx.container.resolve('flagService');
			return await flagService.prepareMigration(migrationData.data);
		}),
	execute: rpcProcedure
		.meta({ permission: 'admin' })
		.input(
			z.object({
				steps: z.array(MigrationStep)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const flagService = ctx.container.resolve('flagService');
			await flagService.executeMigration(input.steps);
		})
});

import { z } from 'zod';

import { EtcdFlag } from './etcd';

export const MigrationFile = z.object({
	environment: z.string(),
	version: z.string().regex(/^\d+\.\d+\.\d+$/),
	createdAt: z.coerce.date(),

	flags: z.record(z.string(), EtcdFlag)
});
export type MigrationFile = z.infer<typeof MigrationFile>;

export const MigrationStep = z.intersection(
	z.object({
		id: z.number(),
		dependentId: z.number().optional(),
		indent: z.number().optional()
	}),
	z.discriminatedUnion('mode', [
		z.object({
			mode: z.literal('CREATE_DEFAULTVALUE'),
			flagKey: z.string(),
			flag: EtcdFlag
		}),
		z.object({
			mode: z.literal('UPDATE_SCHEMA_DEFAULTVALUE'),
			flagKey: z.string(),
			flag: EtcdFlag
		}),
		z.object({
			mode: z.literal('SET_VALUE'),
			flagKey: z.string(),
			flag: EtcdFlag
		}),
		z.object({
			mode: z.literal('DELETE'),
			flagKey: z.string()
		})
	])
);
export type MigrationStep = z.infer<typeof MigrationStep>;
export type MigrationStepMode = MigrationStep['mode'];

export const MigrationSummary = z.object({
	environment: z.string(),
	version: z.string(),
	createdAt: z.coerce.date(),
	steps: z.array(MigrationStep)
});
export type MigrationSummary = z.infer<typeof MigrationSummary>;

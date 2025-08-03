import { z } from 'zod';

import { EtcdFlag } from './etcd';

export const MigrationFile = z.object({
	environment: z.string(),
	version: z.string().regex(/^\d+\.\d+\.\d+$/),
	createdAt: z.coerce.date(),

	flags: z.record(z.string(), EtcdFlag)
});
export type MigrationFile = z.infer<typeof MigrationFile>;

export const MigrationStep = z.object({
	mode: z.enum(['create', 'update', 'delete']),
	name: z.string()
});
export type MigrationStep = z.infer<typeof MigrationStep>;

export const MigrationSummary = z.object({
	environment: z.string(),
	version: z.string(),
	createdAt: z.coerce.date(),
	steps: z.array(MigrationStep)
});
export type MigrationSummary = z.infer<typeof MigrationSummary>;

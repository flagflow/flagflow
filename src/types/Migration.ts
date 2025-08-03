import { z } from 'zod';

import { EtcdFlag, EtcdFlagKey } from './etcd';

export const MigrationFile = z.object({
	environment: z.string(),
	version: z.string().regex(/^\d+\.\d+\.\d+$/),
	createdAt: z.coerce.date(),

	flags: z.record(EtcdFlagKey, EtcdFlag)
});
export type MigrationFile = z.infer<typeof MigrationFile>;

import { z } from 'zod';

export const EtcdFlag = z.object({
	name: z.string().trim(),
	enabled: z.boolean(),
	passwordHash: z.string(),
	passwordExpireAt: z.number().int().positive().optional(),
	roles: z.array(z.string())
});
export type EtcdFlag = z.infer<typeof EtcdFlag>;

export { EtcdHierarchicalKey as EtcdFlagKey } from './base';

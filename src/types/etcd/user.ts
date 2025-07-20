import { z } from 'zod';

import { UserRoleZodEnum } from '$types/UserRoles';

export const EtcdUserKey = z
	.string()
	.regex(
		/^[\d.@a-z-]+$/,
		"String must only contain lowercase letters, numbers, hyphens, '@', or '.'"
	);
export const EtcdUser = z
	.object({
		name: z.string().trim(),
		enabled: z.boolean(),
		passwordHash: z.string(),
		passwordExpireAt: z.number().int().positive().optional(),
		roles: z.array(UserRoleZodEnum)
	})
	.readonly();
export type EtcdUser = z.infer<typeof EtcdUser>;

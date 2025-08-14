import { z } from 'zod';

import { UserPermissionZodEnum } from '$types/UserPermissions';

export const PersistentUserKey = z
	.string()
	.regex(
		/^[\d.@a-z-]+$/,
		"String must only contain lowercase letters, numbers, hyphens, '@', or '.'"
	);
export const PersistentUser = z
	.object({
		name: z.string().trim(),
		enabled: z.boolean(),
		passwordHash: z.string(),
		passwordExpireAt: z.number().int().positive().optional(),
		permissions: z.array(UserPermissionZodEnum)
	})
	.readonly();
export type PersistentUser = z.infer<typeof PersistentUser>;

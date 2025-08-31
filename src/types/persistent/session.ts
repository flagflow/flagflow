import { z } from 'zod';

import { UserPermissionZodEnum } from '$types/UserPermissions';

import { PersistentTouchable } from './base';

export const PersistentSession = z
	.intersection(
		PersistentTouchable,
		z.object({
			userKey: z.string().trim(),
			userName: z.string().trim(),
			createdAt: z.coerce.date(),
			permissions: z.array(UserPermissionZodEnum)
		})
	)
	.readonly();
export type PersistentSession = z.infer<typeof PersistentSession>;

export const PersistentSessionKeyRegExp = /^[\w-]+$/i;
export const PersistentSessionKey = z
	.string()
	.regex(PersistentSessionKeyRegExp, 'String must only contain a-z, 0-9, hyphens and underscores');

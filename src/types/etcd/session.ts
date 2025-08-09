import { z } from 'zod';

import { UserPermissionZodEnum } from '$types/UserPermissions';

import { EtcdTouchable } from './base';

export const EtcdSession = z
	.intersection(
		EtcdTouchable,
		z.object({
			userKey: z.string().trim(),
			userName: z.string().trim(),
			createdAt: z.coerce.date(),
			permissions: z.array(UserPermissionZodEnum)
		})
	)
	.readonly();
export type EtcdSession = z.infer<typeof EtcdSession>;

export { EtcdKey as EtcdSessionKey } from './base';

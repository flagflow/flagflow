import { z } from 'zod';

import { UserRoleZodEnum } from '$types/UserRoles';

import { EtcdTouchable } from './base';

export const EtcdSession = z
	.intersection(
		EtcdTouchable,
		z.object({
			userKey: z.string().trim(),
			userName: z.string().trim(),
			createdAt: z.coerce.date(),
			roles: z.array(UserRoleZodEnum)
		})
	)
	.readonly();
export type EtcdSession = z.infer<typeof EtcdSession>;

export { EtcdKey as EtcdSessionKey } from './base';

import { z } from 'zod';

import { EtcdTouchable } from './base';

export const EtcdSession = z.intersection(
	EtcdTouchable,
	z.object({
		userName: z.string().trim(),
		createdAt: z.date({ coerce: true }),
		roles: z.array(z.string())
	})
);
export type EtcdSession = z.infer<typeof EtcdSession>;

export { EtcdKey as EtcdSessionKey } from './base';

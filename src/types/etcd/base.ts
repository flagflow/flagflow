import { z } from 'zod';

export const EtcdKey = z
	.string()
	.regex(/^[\da-z-]+$/, 'String must only contain lowercase letters, numbers and hyphens');
export const EtcdHierarchicalKey = z
	.string()
	.regex(
		/^[\da-z-](?:[\d/a-z-]*[\da-z-])?$/,
		'String must only contain lowercase letters, numbers, hyphens and slashes'
	);

export const EtcdTouchable = z.object({
	expiredAt: z.number().int().positive(),
	ttlSeconds: z.number().int().positive()
});
export type EtcdTouchable = z.infer<typeof EtcdTouchable>;

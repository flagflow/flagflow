import { z } from 'zod';

export const EtcdKeyRegExp = /^[\da-z-]+$/;
export const EtcdKey = z
	.string()
	.regex(EtcdKeyRegExp, 'String must only contain a-z, 0-9 and hyphens');

export const EtcdHierarchicalKeyRegExp: RegExp =
	/^[a-z][\da-z]*(?:_[\da-z]+)*(?:\/[a-z][\da-z]*(?:_[\da-z]+)*)*$/;
export const EtcdHierarchicalKeyInputRegExp: RegExp = /^[\d/_a-z]*$/;
export const EtcdHierarchicalKey = z
	.string()
	.regex(
		EtcdHierarchicalKeyRegExp,
		'String must only contain a-z, 0-9, underscores and slashes in middle'
	);

export const EtcdTouchable = z.object({
	expiredAt: z.number().int().positive(),
	ttlSeconds: z.number().int().positive()
});
export type EtcdTouchable = z.infer<typeof EtcdTouchable>;

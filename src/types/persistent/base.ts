import { z } from 'zod';

export const PersistentKeyRegExp = /^[\da-z-]+$/;
export const PersistentKey = z
	.string()
	.regex(PersistentKeyRegExp, 'String must only contain a-z, 0-9 and hyphens');

export const PersistentHierarchicalKeyRegExp: RegExp =
	/^[a-z][\da-z]*(?:_[\da-z]+)*(?:\/[a-z][\da-z]*(?:_[\da-z]+)*)*$/;
export const PersistentHierarchicalKeyInputRegExp: RegExp = /^[\d/_a-z]*$/;
export const PersistentHierarchicalKey = z
	.string()
	.regex(
		PersistentHierarchicalKeyRegExp,
		'String must only contain a-z, 0-9, underscores and slashes in middle'
	);

export const PersistentTouchable = z.object({
	expiredAt: z.number().int().positive(),
	ttlSeconds: z.number().int().positive()
});
export type PersistentTouchable = z.infer<typeof PersistentTouchable>;

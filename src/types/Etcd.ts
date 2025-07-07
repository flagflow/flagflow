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

// EtcdTouchable
export const EtcdTouchable = z.object({
	expiredAt: z.number().int().positive(),
	ttlSeconds: z.number().int().positive()
});
export type EtcdTouchable = z.infer<typeof EtcdTouchable>;

// EtcdUser
export const EtcdUserKey = z
	.string()
	.regex(
		/^[\d.@a-z-]+$/,
		"String must only contain lowercase letters, numbers, hyphens, '@', or '.'"
	);
export const EtcdUser = z.object({
	name: z.string().trim(),
	enabled: z.boolean(),
	passwordHash: z.string(),
	passwordExpireAt: z.number().int().positive().optional(),
	roles: z.array(z.string())
});
export type EtcdUser = z.infer<typeof EtcdUser>;

// EtcdSession
export const EtcdSession = z.intersection(
	EtcdTouchable,
	z.object({
		userName: z.string().trim(),
		createdAt: z.date({ coerce: true }),
		roles: z.array(z.string())
	})
);
export type EtcdSession = z.infer<typeof EtcdSession>;

// Schemas
export type EtcdAnyObject = EtcdUser | EtcdSession;
export const EtcdSchema = {
	user: EtcdUser,
	session: EtcdSession
} as const;
export type EtcdSchemaKey = keyof typeof EtcdSchema;
export type EtcdSchemaDataType<K extends EtcdSchemaKey> = z.infer<(typeof EtcdSchema)[K]>;
export type EtcdSchemaDataTypeWithKey<K extends EtcdSchemaKey> = {
	key: string;
} & EtcdSchemaDataType<K>;

// Record types
export type EtcdRecord<T extends EtcdAnyObject> = Record<string, T | undefined>;
export type EtcdWithKey<T extends EtcdAnyObject> = { key: string } & T;
export const etcdRecordToArray = <T extends EtcdAnyObject>(
	record: EtcdRecord<T>
): EtcdWithKey<T>[] =>
	Object.entries(record).map(([key, value]) => ({ key, ...value }) as EtcdWithKey<T>);

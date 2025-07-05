import { z } from 'zod';

// EtcdTouchable
export const EtcdTouchable = z.object({
	expiredAt: z.number().int().positive(),
	ttlSeconds: z.number().int().positive()
});
export type EtcdTouchable = z.infer<typeof EtcdTouchable>;

// EtcdUser
export const EtcdUser = z.object({
	name: z.string().trim(),
	passwordHash: z.string(),
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

// Stores
export type EtcdAnyObject = EtcdUser | EtcdSession;
export const EtcdStore = {
	user: EtcdUser,
	session: EtcdSession
} as const;
export type EtcdStoreKey = keyof typeof EtcdStore;
export type EtcdStoreDataType<K extends EtcdStoreKey> = z.infer<(typeof EtcdStore)[K]>;
export type EtcdStoreDataTypeWithKey<K extends EtcdStoreKey> = {
	key: string;
} & EtcdStoreDataType<K>;

// Record types
export type EtcdRecord<T extends EtcdAnyObject> = Record<string, T | undefined>;
export type EtcdWithKey<T extends EtcdAnyObject> = { key: string } & T;
export const etcdRecordToArray = <T extends EtcdAnyObject>(
	record: EtcdRecord<T>
): EtcdWithKey<T>[] =>
	Object.entries(record).map(([key, value]) => ({ key, ...value }) as EtcdWithKey<T>);

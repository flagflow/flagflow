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
	passwordHash: z.string().trim(),
	roles: z.array(z.string())
});
export type EtcdUser = z.infer<typeof EtcdUser>;

// EtcdSession
export const EtcdSession = z.intersection(
	EtcdTouchable,
	z.object({
		name: z.string().trim(),
		roles: z.array(z.string())
	})
);
export type EtcdSession = z.infer<typeof EtcdSession>;

// Stores
export type EtcdAnyObject = EtcdUser | EtcdSession;
export const EtcdStores = {
	user: EtcdUser,
	session: EtcdSession
} as const;
export type EtcdStore = keyof typeof EtcdStores;
export type EtcdStoreDataType<K extends EtcdStore> = z.infer<(typeof EtcdStores)[K]>;
export type EtcdStoreDataTypeWithKey<K extends EtcdStore> = { key: string } & EtcdStoreDataType<K>;

// Record types
export type EtcdRecord<T extends EtcdAnyObject> = Record<string, T | undefined>;
export const etcdRecordToArray = <T extends EtcdAnyObject>(
	record: EtcdRecord<T>
): EtcdStoreDataTypeWithKey<keyof typeof EtcdStores>[] => {
	return Object.entries(record).map(
		([key, value]) =>
			({
				key,
				...value
			}) as EtcdStoreDataTypeWithKey<keyof typeof EtcdStores>
	);
};

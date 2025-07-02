import { z } from 'zod';

// EtcdUser
export const EtcdUser = z.object({
	name: z.string().trim(),
	passwordHash: z.string().trim(),
	roles: z.array(z.string())
});
export type EtcdUser = z.infer<typeof EtcdUser>;

// EtcdSession
export const EtcdSession = z.object({
	name: z.string().trim(),
	roles: z.array(z.string())
});
export type EtcdSession = z.infer<typeof EtcdSession>;

// All
export type EtcdAny = EtcdUser | EtcdSession;
export type EtcdWithKey<K extends EtcdAny> = { key: string } & K;

// Stores
export const EtcdStores = {
	user: EtcdUser,
	session: EtcdSession
} as const;
export type EtcdStore = keyof typeof EtcdStores;
export type EtcdStoreDataType<K extends EtcdStore> = z.infer<(typeof EtcdStores)[K]>;
export type EtcdStoreDataTypeWithKey<K extends EtcdStore> = { key: string } & EtcdStoreDataType<K>;

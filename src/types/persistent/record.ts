import type { PersistentAnyObject } from './schema';

export type PersistentRecord<T extends PersistentAnyObject> = Record<string, T | undefined>;
export type PersistentWithKey<T extends PersistentAnyObject> = { key: string } & T;
export const persistentRecordToArray = <T extends PersistentAnyObject>(
	record: PersistentRecord<T>
): PersistentWithKey<T>[] =>
	Object.entries(record)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => ({ key, ...value }) as PersistentWithKey<T>);

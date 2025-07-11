import type { EtcdAnyObject } from './schema';

export type EtcdRecord<T extends EtcdAnyObject> = Record<string, T | undefined>;
export type EtcdWithKey<T extends EtcdAnyObject> = { key: string } & T;
export const etcdRecordToArray = <T extends EtcdAnyObject>(
	record: EtcdRecord<T>
): EtcdWithKey<T>[] =>
	Object.entries(record)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => ({ key, ...value }) as EtcdWithKey<T>);

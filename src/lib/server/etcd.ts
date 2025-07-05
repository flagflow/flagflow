import { Etcd3, type SortTarget } from 'etcd3';

import {
	EtcdStore,
	type EtcdStoreDataType,
	type EtcdStoreDataTypeWithKey,
	type EtcdStoreKey
} from '$types/Etcd';

import type { ChildLogger } from './log';

type EtcdConfig = {
	server: string;
	username: string | undefined;
	password: string | undefined;
	namespace: string;
};

let cachedClient: Etcd3;
const getEtcdClient = (config: EtcdConfig, logger: ChildLogger) => {
	if (!cachedClient) {
		cachedClient =
			config.username && config.password
				? new Etcd3({
						hosts: config.server,
						auth: {
							username: config.username,
							password: config.password
						}
					})
				: new Etcd3({ hosts: config.server });
		logger.debug(`Connecting at ${config.server} with username ${config.username}`);
	}
	return cachedClient;
};

export const getEtcd = (config: EtcdConfig, logger: ChildLogger) => {
	const genEtcdPrefix = (store: EtcdStoreKey) => `/flagflow/${config.namespace}/${store}/`;
	const genEtcdKey = (store: EtcdStoreKey, name: string) => genEtcdPrefix(store) + name;

	const client = getEtcdClient(config, logger);

	return {
		get: async <K extends EtcdStoreKey>(
			store: K,
			name: string
		): Promise<EtcdStoreDataTypeWithKey<K> | undefined> => {
			const key = genEtcdKey(store, name);
			try {
				const etcdValue = await client.get(key).string();
				if (etcdValue === null) return undefined;

				const schema = EtcdStore[store];
				const data = schema.parse(JSON.parse(etcdValue));
				if ('expiredAt' in data && data.expiredAt < Date.now()) {
					logger.debug({ key }, 'Expired');
					return undefined;
				}

				logger.debug({ key }, 'Get');
				return {
					key: name,
					...data
				};
			} catch (error) {
				logger.error(`Error parsing key: ${key}`, error);
				return undefined;
			}
		},
		put: async <K extends EtcdStoreKey>(
			store: K,
			name: string,
			data: EtcdStoreDataType<K>
		): Promise<void> => {
			const key = genEtcdKey(store, name);

			try {
				await client.put(key).value(JSON.stringify(data));
				logger.debug({ key }, 'Put');
			} catch (error) {
				logger.error(`Error putting key: ${key}`, error);
				throw error;
			}
		},
		delete: async <K extends EtcdStoreKey>(store: K, name: string) => {
			const key = genEtcdKey(store, name);
			try {
				const etcdValue = await client.get(key).string();
				if (etcdValue === null) {
					logger.warn({ key }, 'Key not found for deletion');
					return;
				}

				await client.delete().key(key);
				logger.debug({ key }, 'Delete');
			} catch (error) {
				logger.error(`Error deleting key: ${key}`, error);
				throw error;
			}
		},
		touch: async <K extends EtcdStoreKey>(store: K, name: string) => {
			const key = genEtcdKey(store, name);
			try {
				const etcdValue = await client.get(key).string();
				if (etcdValue === null) return;

				const schema = EtcdStore[store];
				const data = schema.parse(JSON.parse(etcdValue));
				if (!('expiredAt' in data) || !('ttlSeconds' in data)) return;

				data.expiredAt = Date.now() + data.ttlSeconds * 1000;
				await client.put(key).value(JSON.stringify(data));

				logger.debug({ key }, 'Touch');
			} catch (error) {
				logger.error(`Error touching key: ${key}`, error);
				throw error;
			}
		},
		//watch: (key: string) => client.watch().key(key).create(),
		list: async <K extends EtcdStoreKey>(
			store: K,
			limit = 0,
			sort: keyof typeof SortTarget = 'Key'
		): Promise<Record<string, EtcdStoreDataType<K> | undefined>> => {
			const prefix = genEtcdPrefix(store);
			const schema = EtcdStore[store];

			const getAllBuilder = client.getAll().prefix(prefix).sort(sort, 'Ascend');
			if (limit > 0) getAllBuilder.limit(limit);

			const data = await getAllBuilder.strings();

			const result: Record<string, EtcdStoreDataType<K> | undefined> = {};
			let success = 0;
			let failed = 0;
			for (const key in data)
				try {
					result[key.slice(prefix.length)] = schema.parse(JSON.parse(data[key]));
					success++;
				} catch {
					result[key.slice(prefix.length)] = undefined;
					failed++;
				}

			logger.debug({ prefix, limit, success, failed }, 'List');
			return result;
		}
	};
};

export const doneEtcdClient = () => {
	cachedClient?.close();
};

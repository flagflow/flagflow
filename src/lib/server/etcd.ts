import { Etcd3 } from 'etcd3';

import {
	type EtcdStore,
	type EtcdStoreDataType,
	type EtcdStoreDataTypeWithKey,
	EtcdStores
} from '$types/Etcd';

import type { ChildLogger } from './log';

type EtcdConfig = {
	server: string;
	username: string | undefined;
	password: string | undefined;
	prefix: string;
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
	const client = getEtcdClient(config, logger);

	const genEtcdPrefix = (store: EtcdStore) => `flagflow/${config.prefix}/${store}/`;
	const genEtcdKey = (store: EtcdStore, name: string) => genEtcdPrefix(store) + name;

	return {
		get: async <K extends EtcdStore>(
			store: K,
			name: string
		): Promise<EtcdStoreDataTypeWithKey<K> | undefined> => {
			const key = genEtcdKey(store, name);
			try {
				const etcdValue = await client.get(key).string();
				if (etcdValue === null) return undefined;

				const schema = EtcdStores[store];
				const data = schema.parse(JSON.parse(etcdValue));
				logger.debug(`Retrieved key: ${key}`);
				return {
					key: name,
					...data
				};
			} catch (error) {
				logger.error(`Error parsing key: ${key}`, error);
				return undefined;
			}
		},
		put: async <K extends EtcdStore>(
			store: K,
			name: string,
			data: EtcdStoreDataType<K>,
			ttlSeconds = 0
		): Promise<void> => {
			const key = genEtcdKey(store, name);

			try {
				await (ttlSeconds > 0
					? client.lease(ttlSeconds, { autoKeepAlive: false }).put(key).value(JSON.stringify(data))
					: client.put(key).value(JSON.stringify(data)));
				logger.debug(`Put key: ${key}`);
			} catch (error) {
				logger.error(`Error putting key: ${key}`, error);
				throw error;
			}
		},
		delete: async <K extends EtcdStore>(store: K, name: string) => {
			const key = genEtcdKey(store, name);
			try {
				await client.delete().key(key);
				logger.debug(`Deleted key: ${key}`);
			} catch (error) {
				logger.error(`Error deleting key: ${key}`, error);
				throw error;
			}
		},
		touch: async <K extends EtcdStore>(store: K, name: string, ttlSeconds: number) => {
			const key = genEtcdKey(store, name);
			try {
				const response = await client.get(key).exec();
				if (!response.kvs || response.kvs.length === 0) return;

				const kv = response.kvs[0];

				await client
					.lease(ttlSeconds, { autoKeepAlive: false })
					.put(key)
					.value(kv.value.toString());

				logger.debug(`Touched key: ${key}`);
			} catch (error) {
				logger.error(`Error touching key: ${key}`, error);
				throw error;
			}
		},
		//watch: (key: string) => client.watch().key(key).create(),
		list: async <K extends EtcdStore>(store: K, limit = 0) => {
			const prefix = genEtcdPrefix(store);
			const getAllBuilder = client.getAll().prefix(prefix);
			if (limit > 0) getAllBuilder.limit(limit);

			const data = await getAllBuilder.strings();
			logger.debug(`Listed keys with prefix: ${store}, limit: ${limit}`);
			return data;
		}
	};
};

export const doneEtcdClient = () => cachedClient?.close();

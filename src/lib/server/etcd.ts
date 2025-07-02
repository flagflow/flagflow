import { Etcd3 } from 'etcd3';

import {
	type EtcdStore,
	type EtcdStoreDataType,
	type EtcdStoreDataTypeWithKey,
	EtcdStores
} from '$types/Etcd';

import type { ChildLogger } from './log';

type EtcdConnection = {
	server: string;
	username: string | undefined;
	password: string | undefined;
};

let cachedClient: Etcd3;
const getEtcdClient = (connection: EtcdConnection, logger: ChildLogger) => {
	if (!cachedClient) {
		cachedClient =
			connection.username && connection.password
				? new Etcd3({
					hosts: connection.server,
					auth: {
						username: connection.username,
						password: connection.password
					}
				})
				: new Etcd3({ hosts: connection.server });
		logger.debug(`Connecting at ${connection.server} with username ${connection.username}`);
	}
	return cachedClient;
};

export const getEtcd = (connection: EtcdConnection, logger: ChildLogger) => {
	const client = getEtcdClient(connection, logger);

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const genEtcdPrefix = (store: EtcdStore) => `${store}/`;
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
				if (ttlSeconds > 0) {
					const lease = client.lease(ttlSeconds);
					try {
						await lease.put(key).value(JSON.stringify(data))
					} finally {
						lease.release();
					}
				}
				else
					await client.put(key).value(JSON.stringify(data));
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
		touch: async <K extends EtcdStore>(store: K, name: string) => {
			const key = genEtcdKey(store, name);
			try {
				const response = await client.get(key).exec();
				if (!response.kvs || response.kvs.length === 0) return;

				const kv = response.kvs[0];
				if (!kv.lease) return

				await client.put(key).value(kv.value.toString()).lease(kv.lease.toString());
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

import { Etcd3, type SortTarget, type Watcher } from 'etcd3';

import {
	EtcdSchema,
	type EtcdSchemaDataType,
	type EtcdSchemaDataTypeWithKey,
	type EtcdSchemaKey
} from '$types/etcd';

import type { ChildLogger } from './log';

type EtcdConfig = {
	server: string;
	username: string | undefined;
	password: string | undefined;
	namespace: string;
};

let cachedClient: Etcd3 | undefined;
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
const resetEtcdClient = () => {
	if (cachedClient) {
		cachedClient.close();
		cachedClient = undefined;
	}
};

const watchers: Set<Watcher> = new Set();
const removeWatcher = (watcher: Watcher) => {
	watchers.delete(watcher);
};
const cleanWatchers = () => {
	for (const watcher of watchers) {
		try {
			watcher.cancel();
		} catch {
			/**/
		}
	}
	watchers.clear();
};

export const getEtcd = (config: EtcdConfig, logger: ChildLogger) => {
	const genEtcdPrefix = (store: EtcdSchemaKey) => `/flagflow/${config.namespace}/${store}/`;
	const genEtcdKey = (store: EtcdSchemaKey, name: string) => genEtcdPrefix(store) + name;

	const client = getEtcdClient(config, logger);

	const existsFunction = async <K extends EtcdSchemaKey>(
		store: K,
		name: string
	): Promise<boolean> => {
		const key = genEtcdKey(store, name);
		try {
			return !!(await client.get(key).string());
		} catch (error) {
			resetEtcdClient();
			logger.error({ key, error }, 'Error when check exists');
			throw error;
		}
	};

	const getFunction = async <K extends EtcdSchemaKey>(
		store: K,
		name: string
	): Promise<EtcdSchemaDataTypeWithKey<K> | undefined> => {
		const key = genEtcdKey(store, name);
		try {
			const etcdValue = await client.get(key).string();
			if (etcdValue === null) return undefined;

			const schema = EtcdSchema[store];
			const data = schema.parse(JSON.parse(etcdValue)) as EtcdSchemaDataType<K>;
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
			resetEtcdClient();
			logger.error({ key, error }, 'Get error');
			return undefined;
		}
	};

	const getOrThrowFunction = async <K extends EtcdSchemaKey>(
		store: K,
		name: string
	): Promise<EtcdSchemaDataTypeWithKey<K>> => {
		const data = await getFunction(store, name);
		if (!data) throw new Error(`Key not exists or invalid: ${store}:${name}`);
		return data;
	};

	return {
		get: getFunction,
		getOrThrow: getOrThrowFunction,
		exists: existsFunction,
		throwIfExists: async <K extends EtcdSchemaKey>(store: K, name: string): Promise<void> => {
			const exists = await existsFunction(store, name);
			if (exists) throw new Error(`Key already exists: ${store}:${name}`);
		},
		throwIfNotExists: async <K extends EtcdSchemaKey>(store: K, name: string): Promise<void> => {
			const exists = await existsFunction(store, name);
			if (!exists) throw new Error(`Key not exists: ${store}:${name}`);
		},
		put: async <K extends EtcdSchemaKey>(
			store: K,
			name: string,
			data: EtcdSchemaDataType<K>
		): Promise<void> => {
			const key = genEtcdKey(store, name);

			try {
				const putData: EtcdSchemaDataType<K> = EtcdSchema[store].parse(
					data
				) as EtcdSchemaDataType<K>;

				await client.put(key).value(JSON.stringify(putData));
				logger.debug({ key }, 'Put');
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Put error');
				throw error;
			}
		},
		overwrite: async <K extends EtcdSchemaKey>(
			store: K,
			name: string,
			data: Partial<EtcdSchemaDataType<K>>
		): Promise<void> => {
			const key = genEtcdKey(store, name);
			try {
				const sourceData = await getOrThrowFunction(store, name);
				const overwrittenData: EtcdSchemaDataType<K> = EtcdSchema[store].parse({
					...sourceData,
					...data
				}) as EtcdSchemaDataType<K>;

				await client.put(key).value(JSON.stringify(overwrittenData));
				logger.debug({ key }, 'Overwrite');
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Overwrite error');
				throw error;
			}
		},
		delete: async <K extends EtcdSchemaKey>(store: K, name: string) => {
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
				resetEtcdClient();
				logger.error({ key, error }, 'Delete error');
				throw error;
			}
		},
		touch: async <K extends EtcdSchemaKey>(store: K, name: string) => {
			const key = genEtcdKey(store, name);
			try {
				const etcdValue = await client.get(key).string();
				if (etcdValue === null) return;

				const schema = EtcdSchema[store];
				const data = schema.parse(JSON.parse(etcdValue));
				if (!('expiredAt' in data) || !('ttlSeconds' in data)) return;

				await client.put(key).value(
					JSON.stringify({
						...data,
						expiredAt: Date.now() + data.ttlSeconds * 1000
					})
				);

				logger.debug({ key }, 'Touch');
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Touch error');
				throw error;
			}
		},
		watch: async <K extends EtcdSchemaKey>(store: K) => {
			const prefix = genEtcdPrefix(store);
			try {
				const result = await client.watch().prefix(genEtcdPrefix(store)).create();
				watchers.add(result);
				logger.debug({ prefix, id: result.id }, 'Watch');

				result.on('end', () => {
					logger.debug({ prefix, id: result.id }, 'Unwatch');
					removeWatcher(result);
				});
				return result;
			} catch (error) {
				resetEtcdClient();
				logger.debug({ prefix, error }, 'Watch error');
				throw error;
			}
		},
		list: async <K extends EtcdSchemaKey>(
			store: K,
			limit = 0,
			sort: keyof typeof SortTarget = 'Key'
		): Promise<{
			list: Record<string, EtcdSchemaDataType<K>>;
			undefs: string[];
		}> => {
			const prefix = genEtcdPrefix(store);
			try {
				const schema = EtcdSchema[store];

				const getAllBuilder = client.getAll().prefix(prefix).sort(sort, 'Ascend');
				if (limit > 0) getAllBuilder.limit(limit);

				const data = await getAllBuilder.strings();

				const list: Record<string, EtcdSchemaDataType<K>> = {};
				const undefs: string[] = [];
				let success = 0;
				let failed = 0;
				for (const key in data)
					try {
						list[key.slice(prefix.length)] = schema.parse(
							JSON.parse(data[key])
						) as EtcdSchemaDataType<K>;
						success++;
					} catch {
						undefs.push(key.slice(prefix.length));
						failed++;
					}

				logger.debug({ prefix, limit, success, failed }, 'List');
				return { list, undefs };
			} catch (error) {
				resetEtcdClient();
				logger.debug({ prefix, error }, 'List error');
				throw error;
			}
		},
		status: async () => {
			try {
				const result = await client.maintenance.status();
				logger.debug({ version: result.version }, 'Status');
				return result;
			} catch (error) {
				resetEtcdClient();
				logger.debug({ error }, 'Status error');
				throw error;
			}
		}
	};
};

export const doneEtcdClient = () => {
	cleanWatchers();
	cachedClient?.close();
};

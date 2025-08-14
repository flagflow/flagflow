import { Etcd3, type Watcher } from 'etcd3';

import {
	PersistentSchema,
	type PersistentSchemaDataType,
	type PersistentSchemaDataTypeWithKey,
	type PersistentSchemaKey
} from '$types/persistent';

import type { ChildLogger } from '../log';
import type { LogService } from '../services';

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
const cleanWatchers = async () => {
	for (const watcher of watchers) {
		try {
			await watcher.cancel();
		} catch {
			/**/
		}
	}
	watchers.clear();
};

export const getPersistenceInstance = (config: EtcdConfig, logService: LogService) => {
	const genEtcdPrefix = (store: PersistentSchemaKey) => `/flagflow/${config.namespace}/${store}/`;
	const genEtcdKey = (store: PersistentSchemaKey, name: string) => genEtcdPrefix(store) + name;

	const logger = logService('etcd');
	const client = getEtcdClient(config, logger);

	const existsFunction = async <K extends PersistentSchemaKey>(
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

	const getFunction = async <K extends PersistentSchemaKey>(
		store: K,
		name: string
	): Promise<PersistentSchemaDataTypeWithKey<K> | undefined> => {
		const key = genEtcdKey(store, name);
		try {
			const etcdValue = await client.get(key).string();
			if (etcdValue === null) return undefined;

			const schema = PersistentSchema[store];
			const data = schema.parse(JSON.parse(etcdValue)) as PersistentSchemaDataType<K>;
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

	const getOrThrowFunction = async <K extends PersistentSchemaKey>(
		store: K,
		name: string
	): Promise<PersistentSchemaDataTypeWithKey<K>> => {
		const data = await getFunction(store, name);
		if (!data) throw new Error(`Key not exists or invalid: ${store}:${name}`);
		return data;
	};

	return {
		get: getFunction,
		getOrThrow: getOrThrowFunction,
		exists: existsFunction,
		convertEtcdKeyToName: <K extends PersistentSchemaKey>(
			store: K,
			key: string
		): string | undefined => {
			const prefix = genEtcdPrefix(store);
			if (!key.startsWith(prefix)) return;
			return key.slice(prefix.length);
		},
		throwIfExists: async <K extends PersistentSchemaKey>(store: K, name: string): Promise<void> => {
			const exists = await existsFunction(store, name);
			if (exists) throw new Error(`Key already exists: ${store}:${name}`);
		},
		throwIfNotExists: async <K extends PersistentSchemaKey>(
			store: K,
			name: string
		): Promise<void> => {
			const exists = await existsFunction(store, name);
			if (!exists) throw new Error(`Key not exists: ${store}:${name}`);
		},
		put: async <K extends PersistentSchemaKey>(
			store: K,
			name: string,
			data: PersistentSchemaDataType<K>
		): Promise<void> => {
			const key = genEtcdKey(store, name);

			try {
				const putData: PersistentSchemaDataType<K> = PersistentSchema[store].parse(
					data
				) as PersistentSchemaDataType<K>;

				await client.put(key).value(JSON.stringify(putData));
				logger.debug({ key }, 'Put');
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Put error');
				throw error;
			}
		},
		overwrite: async <K extends PersistentSchemaKey>(
			store: K,
			name: string,
			data: Partial<PersistentSchemaDataType<K>>
		): Promise<void> => {
			const key = genEtcdKey(store, name);
			try {
				const sourceData = await getOrThrowFunction(store, name);
				const overwrittenData: PersistentSchemaDataType<K> = PersistentSchema[store].parse({
					...sourceData,
					...data
				}) as PersistentSchemaDataType<K>;

				await client.put(key).value(JSON.stringify(overwrittenData));
				logger.debug({ key }, 'Overwrite');
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Overwrite error');
				throw error;
			}
		},
		delete: async <K extends PersistentSchemaKey>(store: K, name: string) => {
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
		touch: async <K extends PersistentSchemaKey>(store: K, name: string) => {
			const key = genEtcdKey(store, name);
			try {
				const etcdValue = await client.get(key).string();
				if (etcdValue === null) return;

				const schema = PersistentSchema[store];
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
		watch: async <K extends PersistentSchemaKey>(store: K) => {
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
		list: async <K extends PersistentSchemaKey>(
			store: K
		): Promise<{
			list: Record<string, PersistentSchemaDataType<K>>;
			undefs: string[];
		}> => {
			const prefix = genEtcdPrefix(store);
			try {
				const schema = PersistentSchema[store];

				const getAllBuilder = client.getAll().prefix(prefix).sort('Key', 'Ascend');

				const data = await getAllBuilder.strings();

				const list: Record<string, PersistentSchemaDataType<K>> = {};
				const undefs: string[] = [];
				let success = 0;
				let failed = 0;
				for (const key in data)
					try {
						list[key.slice(prefix.length)] = schema.parse(
							JSON.parse(data[key])
						) as PersistentSchemaDataType<K>;
						success++;
					} catch {
						undefs.push(key.slice(prefix.length));
						failed++;
					}

				logger.debug({ prefix, success, failed }, 'List');
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

export const doneEtcdClient = async () => {
	await cleanWatchers();
	cachedClient?.close();
};

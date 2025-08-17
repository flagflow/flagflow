import { Etcd3, type Watcher } from 'etcd3';

import type { PersistentSchemaKey } from '$types/persistent';

import type { ChildLogger } from '../log';
import type { PersistentEngine, PersistentEngineWatcherCallback } from './types';

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

export const getEtcdEngine = (config: EtcdConfig, logger: ChildLogger): PersistentEngine => {
	const client = getEtcdClient(config, logger);
	return {
		getPrefix: (store: PersistentSchemaKey) => `/flagflow/${config.namespace}/${store}/`,
		getKey: (store: PersistentSchemaKey, name: string) =>
			`/flagflow/${config.namespace}/${store}/${name}`,

		exists: async (key: string) => {
			logger.debug({ key }, 'Exists');
			try {
				return !!(await client.get(key).string());
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Error when checking exists');
				throw error;
			}
		},
		get: async (key: string) => {
			logger.debug({ key }, 'Get');
			try {
				const value = await client.get(key).string();
				return value ?? undefined;
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Error when getting value');
				throw error;
			}
		},
		put: async (key: string, value: string) => {
			logger.debug({ key }, 'Put');
			try {
				await client.put(key).value(value);
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Error when putting value');
				throw error;
			}
		},
		delete: async (key: string) => {
			logger.debug({ key }, 'Delete');
			try {
				await client.delete().key(key);
			} catch (error) {
				resetEtcdClient();
				logger.error({ key, error }, 'Error when deleting value');
				throw error;
			}
		},
		list: async (prefix: string) => {
			try {
				const result = await client.getAll().prefix(prefix).sort('Key', 'Ascend').strings();
				const resultNormalizedKeys = Object.fromEntries(
					Object.entries(result).map(([key, value]) => [key.slice(prefix.length), value])
				);
				logger.debug({ prefix, count: Object.keys(resultNormalizedKeys).length }, 'List');
				return resultNormalizedKeys;
			} catch (error) {
				resetEtcdClient();
				logger.error({ prefix, error }, 'Error when listing keys');
				throw error;
			}
		},

		watch: async (prefix: string, onEvent: PersistentEngineWatcherCallback) => {
			logger.debug({ prefix }, 'Watch');
			const watcher = await client.watch().prefix(prefix).create();
			watcher.on('put', (key) =>
				onEvent('data', key.key.toString().slice(prefix.length), key.value.toString())
			);
			watcher.on('delete', (key) => onEvent('delete', key.key.toString().slice(prefix.length)));
			watchers.add(watcher);
			return {
				stop: async () => {
					await watcher.cancel();
					removeWatcher(watcher);
				}
			};
		},
		close: async () => {
			logger.debug('Close');
			await cleanWatchers();
			resetEtcdClient();
		},
		status: async () => {
			try {
				const result = await client.maintenance.status();
				logger.debug({ version: result.version }, 'Status');
				return result.version;
			} catch (error) {
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

import {
	PersistentSchema,
	type PersistentSchemaDataType,
	type PersistentSchemaDataTypeWithKey,
	type PersistentSchemaKey
} from '$types/persistent';

import type { ConfigService, LogService } from '../services';
import { getEtcdEngine } from './etcdEngine';
import { getFsEngine } from './fsEngine';
import type {
	PersistentEngine,
	PersistentEngineWatcherCallback,
	PersistentEngineWatcherClose
} from './types';

export const getPersistenceInstance = (config: ConfigService, logService: LogService) => {
	const logger = logService('persistence');
	const engine: PersistentEngine = config.etcd.server
		? getEtcdEngine(config.etcd, logService('etcd'))
		: getFsEngine(config, logService('fs'));

	const existsFunction = async <K extends PersistentSchemaKey>(
		store: K,
		name: string
	): Promise<boolean> => {
		const key = engine.getKey(store, name);
		try {
			return await engine.exists(key);
		} catch (error) {
			logger.error({ key, error }, 'Error when check exists');
			throw error;
		}
	};

	const getFunction = async <K extends PersistentSchemaKey>(
		store: K,
		name: string
	): Promise<PersistentSchemaDataTypeWithKey<K> | undefined> => {
		const key = engine.getKey(store, name);
		try {
			const etcdValue = await engine.get(key);
			if (!etcdValue) return undefined;

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
			const prefix = engine.getPrefix(store);
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
			const key = engine.getKey(store, name);

			try {
				const putData: PersistentSchemaDataType<K> = PersistentSchema[store].parse(
					data
				) as PersistentSchemaDataType<K>;

				await engine.put(key, JSON.stringify(putData));
				logger.debug({ key }, 'Put');
			} catch (error) {
				logger.error({ key, error }, 'Put error');
				throw error;
			}
		},
		overwrite: async <K extends PersistentSchemaKey>(
			store: K,
			name: string,
			data: Partial<PersistentSchemaDataType<K>>
		): Promise<void> => {
			const key = engine.getKey(store, name);
			try {
				const sourceData = await getOrThrowFunction(store, name);
				const overwrittenData: PersistentSchemaDataType<K> = PersistentSchema[store].parse({
					...sourceData,
					...data
				}) as PersistentSchemaDataType<K>;

				await engine.put(key, JSON.stringify(overwrittenData));
				logger.debug({ key }, 'Overwrite');
			} catch (error) {
				logger.error({ key, error }, 'Overwrite error');
				throw error;
			}
		},
		delete: async <K extends PersistentSchemaKey>(store: K, name: string) => {
			const key = engine.getKey(store, name);
			try {
				const etcdValue = await engine.get(key);
				if (!etcdValue) {
					logger.warn({ key }, 'Key not found for deletion');
					return;
				}

				await engine.delete(key);
				logger.debug({ key }, 'Delete');
			} catch (error) {
				logger.error({ key, error }, 'Delete error');
				throw error;
			}
		},
		touch: async <K extends PersistentSchemaKey>(store: K, name: string) => {
			const key = engine.getKey(store, name);
			try {
				const etcdValue = await engine.get(key);
				if (!etcdValue) return;

				const schema = PersistentSchema[store];
				const data = schema.parse(JSON.parse(etcdValue));
				if (!('expiredAt' in data) || !('ttlSeconds' in data)) return;

				await engine.put(
					key,
					JSON.stringify({
						...data,
						expiredAt: Date.now() + data.ttlSeconds * 1000
					})
				);

				logger.debug({ key }, 'Touch');
			} catch (error) {
				logger.error({ key, error }, 'Touch error');
				throw error;
			}
		},
		watch: async <K extends PersistentSchemaKey>(
			store: K,
			onEvent: PersistentEngineWatcherCallback
		): Promise<PersistentEngineWatcherClose> => {
			const prefix = engine.getPrefix(store);
			try {
				logger.debug({ prefix }, 'Watch');
				return await engine.watch(prefix, onEvent);
			} catch (error) {
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
			const prefix = engine.getPrefix(store);
			try {
				const schema = PersistentSchema[store];

				const data = await engine.list(prefix);

				const list: Record<string, PersistentSchemaDataType<K>> = {};
				const undefs: string[] = [];
				let success = 0;
				let failed = 0;
				for (const key in data)
					try {
						list[key] = schema.parse(JSON.parse(data[key])) as PersistentSchemaDataType<K>;
						success++;
					} catch {
						undefs.push(key.slice(prefix.length));
						failed++;
					}

				logger.debug({ prefix, success, failed }, 'List');
				return { list, undefs };
			} catch (error) {
				logger.debug({ prefix, error }, 'List error');
				throw error;
			}
		},
		status: async () => {
			try {
				const status = await engine.status();
				logger.trace({ status }, 'Status');
				return status;
			} catch (error) {
				logger.error({ error }, 'Status error');
				throw error;
			}
		}
	};
};

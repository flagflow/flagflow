import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { type FSWatcher, watch } from 'chokidar';

import type { PersistentSchemaKey } from '$types/persistent';

import type { ChildLogger } from '../log';
import type { ConfigService } from '../services';
import type { PersistentEngine, PersistentEngineWatcherCallback } from './types';

const watchers: Set<FSWatcher> = new Set();
const removeWatcher = (watcher: FSWatcher) => {
	watchers.delete(watcher);
};
const cleanWatchers = async () => {
	for (const watcher of watchers) {
		try {
			watcher.close();
		} catch {
			/**/
		}
	}
	watchers.clear();
};

export const getFsEngine = (config: ConfigService, logger: ChildLogger): PersistentEngine => {
	return {
		getPrefix: (store: PersistentSchemaKey) => `${config.fsPersistentRoot}/${store}/`,
		getKey: (store: PersistentSchemaKey, name: string) =>
			`${config.fsPersistentRoot}/${store}/${name}`,

		exists: async (key: string) => {
			logger.debug({ key }, 'Exists');
			try {
				await mkdir(path.dirname(key), { recursive: true });
				if (!existsSync(key)) return false;
				const stats = await stat(key);
				return stats.isFile();
			} catch (error) {
				logger.error({ key, error }, 'Error when checking exists');
				throw error;
			}
		},
		get: async (key: string) => {
			logger.debug({ key }, 'Get');
			try {
				await mkdir(path.dirname(key), { recursive: true });
				if (!existsSync(key)) return;
				const stats = await stat(key);
				if (!stats.isFile()) return;

				const fileData = await readFile(key);
				return fileData.toString();
			} catch (error) {
				logger.error({ key, error }, 'Error when getting value');
				throw error;
			}
		},
		put: async (key: string, value: string) => {
			logger.debug({ key }, 'Put');
			try {
				await mkdir(path.dirname(key), { recursive: true });
				await writeFile(key, value);
			} catch (error) {
				logger.error({ key, error }, 'Error when getting value');
				throw error;
			}
		},
		delete: async (key: string) => {
			logger.debug({ key }, 'Delete');
			try {
				await mkdir(path.dirname(key), { recursive: true });
				await rm(key);
			} catch (error) {
				logger.error({ key, error }, 'Error when deleting value');
				throw error;
			}
		},
		list: async (prefix: string) => {
			try {
				await mkdir(prefix, { recursive: true });
				let files = await readdir(prefix, { recursive: true });
				files = files.filter((file) => file.startsWith(prefix));

				logger.debug({ prefix, count: files.length }, 'List');
				const result: Record<string, string> = {};
				for (const file of files) result[file] = (await readFile(file)).toString();
				return result;
			} catch (error) {
				logger.error({ prefix, error }, 'Error when listing values');
				throw error;
			}
		},
		watch: async (prefix: string, onEvent: PersistentEngineWatcherCallback) => {
			logger.debug({ prefix }, 'Watch');
			try {
				await mkdir(prefix, { recursive: true });
				const watcher = watch(prefix, {
					persistent: true,
					awaitWriteFinish: true,
					ignoreInitial: true,
					usePolling: false,
					alwaysStat: false
				});
				watcher.add(prefix);
				watcher.on('add', (path: string) => {
					//console.log('add', path);
					onEvent('data', path.slice(prefix.length), readFile(path).toString());
				});
				watcher.on('change', (path: string) => {
					//console.log('change', path);
					onEvent('data', path.slice(prefix.length), readFile(path).toString());
				});
				watcher.on('unlink', (path: string) => {
					//console.log('unlink', path);
					onEvent('delete', path.slice(prefix.length));
				});
				watchers.add(watcher);
				return {
					stop: async () => {
						watcher.close();
						removeWatcher(watcher);
					}
				};
			} catch (error) {
				logger.error({ prefix, error }, 'Error when watching');
				throw error;
			}
		},
		close: async () => {
			logger.debug('Close');
			await cleanWatchers();
		},
		status: async () => {
			try {
				await mkdir(config.fsPersistentRoot, { recursive: true });
				const files = await readdir(config.fsPersistentRoot, { recursive: true });
				logger.debug({ count: files.length }, 'Status');
				return files.length.toString();
			} catch (error) {
				logger.debug({ error }, 'Status error');
				throw error;
			}
		}
	};
};

export const doneFsClient = async () => {
	await cleanWatchers();
};

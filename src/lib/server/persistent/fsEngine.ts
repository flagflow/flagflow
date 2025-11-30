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
	for (const watcher of watchers)
		try {
			watcher.close();
		} catch {
			/**/
		}

	watchers.clear();
};
const emitWatchers = (event: 'change' | 'unlink', key: string) => {
	for (const watcher of watchers)
		try {
			const fullPath = path.resolve(key);
			const folder = path.dirname(fullPath);
			const filename = path.basename(fullPath);

			const watcheds = watcher.getWatched();
			if (watcheds[folder] && (event === 'change' || watcheds[folder].includes(filename)))
				watcher.emit(event, path.normalize(key));
		} catch {
			/**/
		}
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
				emitWatchers('change', key);
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
				emitWatchers('unlink', key);
			} catch (error) {
				logger.error({ key, error }, 'Error when deleting value');
				throw error;
			}
		},
		list: async (prefix: string) => {
			try {
				prefix = path.normalize(prefix);
				await mkdir(prefix, { recursive: true });

				const files = await readdir(prefix, { recursive: true, withFileTypes: true });
				const realFiles = files
					.filter((f) => f.isFile())
					.map((f) => path.join(f.parentPath, f.name));
				logger.debug({ prefix, count: realFiles.length }, 'List');

				const result: Record<string, string> = {};
				for (const file of realFiles)
					result[file.slice(prefix.length)] = (await readFile(file)).toString();
				return result;
			} catch (error) {
				logger.error({ prefix, error }, 'Error when listing values');
				throw error;
			}
		},
		watch: async (prefix: string, onEvent: PersistentEngineWatcherCallback) => {
			logger.debug({ prefix }, 'Watch');
			try {
				prefix = path.normalize(prefix);
				await mkdir(prefix, { recursive: true });
				const watcher = watch(prefix, {
					usePolling: false,
					ignoreInitial: true,
					persistent: true,

					awaitWriteFinish: false,
					alwaysStat: false,
					atomic: true
				});
				watcher.on('add', async (path: string) =>
					onEvent('data', path.slice(prefix.length), (await readFile(path)).toString())
				);
				watcher.on('change', async (path: string) =>
					onEvent('data', path.slice(prefix.length), (await readFile(path)).toString())
				);
				watcher.on('unlink', (path: string) => onEvent('delete', path.slice(prefix.length)));

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
				logger.trace({ count: files.length }, 'Status');
				return files.length.toString();
			} catch (error) {
				logger.error({ error }, 'Status error');
				throw error;
			}
		}
	};
};

export const doneFsClient = async () => {
	await cleanWatchers();
};

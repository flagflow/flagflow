import type { Watcher } from 'etcd3';

import { EtcdFlag } from '$types/etcd';

import type { ConfigService, EtcdService, LogService } from '../index';
import { generateHashInfo } from './GroupHashGenerator';
import { generateTSTypeFileContent, generateTSZodFileContent } from './TSFileGenerator';

type FlagServiceParameters = {
	configService: ConfigService;
	etcdService: EtcdService;
	logService: LogService;
};

type FlagTypeDescriptor = {
	tsFileContent: string;
	zodFileContent: string;
	groupTypeHash: Map<string, string>;
};

let flags: Record<string, EtcdFlag> | undefined;
let flagWatcher: Watcher | undefined;
let flagTypeDescriptor: FlagTypeDescriptor | undefined;

export const FlagService = ({ etcdService, logService }: FlagServiceParameters) => {
	const log = logService('flag');
	const logWatch = logService('flag-watch');

	const accessFlags = async (): Promise<Record<string, EtcdFlag>> => {
		if (flags === undefined) {
			const { list } = await etcdService.list('flag');
			flags = list;
			log.info({ count: Object.keys(flags).length }, 'Initialized flags');
		}

		if (flagWatcher === undefined) {
			flagWatcher = await etcdService.watch('flag');
			log.info('Watching flags');

			flagWatcher.on('put', async (etcdKeyValue) => {
				const key = etcdKeyValue.key.toString();
				const name = etcdService.convertEtcdKeyToName('flag', key);
				if (!name) {
					log.warn({ key }, 'Invalid flag key');
					return;
				}

				if (flags)
					try {
						const value = etcdKeyValue.value.toString();
						const valueObject = JSON.parse(value);
						const flag = EtcdFlag.parse(valueObject);
						flags[name] = flag;
						logWatch.debug({ key: name }, 'Updated flag');
					} catch {
						log.warn({ key: name }, 'Failed to parse updated flag value');
					}
				flagTypeDescriptor = undefined;
			});
			flagWatcher.on('delete', (etcdKeyValue) => {
				const key = etcdKeyValue.key.toString();
				const name = etcdService.convertEtcdKeyToName('flag', key);
				if (!name) {
					log.warn({ key }, 'Invalid flag key');
					return;
				}

				if (flags) {
					delete flags[name];
					logWatch.debug({ key: name }, 'Deleted flag');
				}
				flagTypeDescriptor = undefined;
			});
		}

		return flags;
	};

	const accessTypeDescriptor = async (): Promise<FlagTypeDescriptor> => {
		if (flagTypeDescriptor === undefined) {
			const flags = await accessFlags();

			const groupTypeHash = generateHashInfo(flags);
			const tsFileContent = generateTSTypeFileContent(flags, groupTypeHash);
			const zodFileContent = generateTSZodFileContent(flags);
			flagTypeDescriptor = { tsFileContent, groupTypeHash, zodFileContent };

			log.info('Generated flag type descriptor');
		}

		return flagTypeDescriptor;
	};

	return {
		list: async () => await accessFlags(),
		getFlag: async (key: string): Promise<EtcdFlag | undefined> => {
			const flags = await accessFlags();
			return flags?.[key] ?? undefined;
		},
		getFlags: async (prefix: string): Promise<Record<string, EtcdFlag>> => {
			const flags = await accessFlags();
			prefix = prefix ? prefix + '/' : '';
			return Object.fromEntries(Object.entries(flags).filter(([name]) => name.startsWith(prefix)));
		},
		getFlagGroups: async (): Promise<string[]> => {
			const types = await accessTypeDescriptor();
			return [...types.groupTypeHash.keys()].map((g) => g.replaceAll('__', '/'));
		},
		getFlagGroupHash: async (group: string): Promise<string> => {
			const types = await accessTypeDescriptor();
			return types.groupTypeHash.get(group.replaceAll('/', '__')) ?? '';
		},
		getTSFileContent: async (): Promise<string> => {
			const types = await accessTypeDescriptor();
			return types.tsFileContent;
		},
		getZodFileContent: async (): Promise<string> => {
			const types = await accessTypeDescriptor();
			return types.zodFileContent;
		}
	};
};
export type FlagService = ReturnType<typeof FlagService>;

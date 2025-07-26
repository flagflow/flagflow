import type { Watcher } from 'etcd3';

import { createEtcdFlagObject, EtcdFlagObject } from '$types/etcd/flagObject';

import type { ConfigService, EtcdService, LogService } from '../index';
import { generateHashInfo } from './GroupHashGenerator';
import { generateTSFileContent } from './TSFileGenerator';

type FlagServiceParameters = {
	configService: ConfigService;
	etcdService: EtcdService;
	logService: LogService;
};

type FlagTypeDescriptor = {
	tsFileContent: string;
	groupTypeHash: Map<string, string>;
};

let flags: Record<string, EtcdFlagObject> | undefined;
let flagWatcher: Watcher | undefined;
let flagTypeDescriptor: FlagTypeDescriptor | undefined;

export const FlagService = ({ etcdService, logService }: FlagServiceParameters) => {
	const log = logService('flag');
	const logWatch = logService('flag-watch');

	const accessFlags = async (): Promise<Record<string, EtcdFlagObject>> => {
		if (flags === undefined) {
			const { list } = await etcdService.list('flag');

			flags = {};
			for (const [key, value] of Object.entries(list)) flags[key] = createEtcdFlagObject(value);
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
						const flag = EtcdFlagObject.parse(valueObject);
						flags[name] = flag;
						logWatch.debug({ key: name }, 'Updated flag');
					} catch {
						log.warn({ key: name }, 'Failed to parse updated flag value');
					}
			});
			flagWatcher.on('delete', (etcdKeyValue) => {
				const key = etcdKeyValue.key.toString();
				const name = etcdService.convertEtcdKeyToName('flag', key);
				if (!name) {
					log.warn({ key }, 'Invalid flag key');
					return;
				}

				if (flags) delete flags[name];
				logWatch.debug({ key: name }, 'Deleted flag');
			});
		}

		return flags;
	};

	const accessTypeDescriptor = async (): Promise<FlagTypeDescriptor> => {
		if (flagTypeDescriptor === undefined) {
			const flags = await accessFlags();

			const groupTypeHash = generateHashInfo(flags);
			const tsFileContent = generateTSFileContent(flags, groupTypeHash);
			flagTypeDescriptor = { tsFileContent, groupTypeHash };

			log.info('Generated flag type descriptor');
		}

		return flagTypeDescriptor;
	};

	return {
		list: async () => await accessFlags(),
		getFlag: async (key: string): Promise<EtcdFlagObject | undefined> => {
			const flags = await accessFlags();
			return flags?.[key] ?? undefined;
		},
		getFlags: async (prefix: string): Promise<Record<string, EtcdFlagObject>> => {
			const flags = await accessFlags();
			return Object.fromEntries(
				Object.entries(flags).filter(([name]) => name.startsWith(prefix ? prefix + '/' : ''))
			);
		},
		//getTypeDescriptor: async (): Promise<FlagTypeDescriptor> => await accessTypeDescriptor(),
		getFlagGroupHash: async (group: string): Promise<string> => {
			const types = await accessTypeDescriptor();
			return types.groupTypeHash.get(group) ?? '';
		},
		getTSFileContent: async (): Promise<string> => {
			const types = await accessTypeDescriptor();
			return types.tsFileContent;
		}
	};
};
export type FlagService = ReturnType<typeof FlagService>;

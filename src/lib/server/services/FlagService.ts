import type { Watcher } from 'etcd3';

import type { EtcdFlag } from '$types/etcd';

import type { ConfigService, EtcdService, LogService } from './index';

type FlagServiceParameters = {
	configService: ConfigService;
	etcdService: EtcdService;
	logService: LogService;
};

let flags: Record<string, EtcdFlag> | undefined;
let flagWatcher: Watcher | undefined;

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

			flagWatcher.on('put', async (key) => {
				logWatch.debug({ key: key.key.toString() }, 'Updated flag');
				if (flags) {
					const updatedFlag = await etcdService.get(key.key.toString());
					if (updatedFlag) {
						flags[key.key.toString()] = updatedFlag;
					}
				}
			});
			flagWatcher.on('delete', (key) => {
				logWatch.debug({ key: key.key.toString() }, 'Deleted flag');
				if (flags) {
					delete flags[key.key.toString()];
				}
			});
		}

		return flags;
	};

	return {
		list: async () => await accessFlags(),
		getFlag: async (key: string): Promise<EtcdFlag | undefined> => {
			const flags = await accessFlags();
			return flags?.[key] ?? undefined;
		},
		getFlags: async (prefix: string): Promise<Record<string, EtcdFlag>> => {
			const flags = await accessFlags();
			return Object.fromEntries(
				Object.entries(flags).filter(([name]) => name.startsWith(prefix ? prefix + '/' : ''))
			);
		}
	};
};
export type FlagService = ReturnType<typeof FlagService>;

import type { PersistentEngineWatcherClose } from '$lib/server/persistent/types';
import type { MigrationFile, MigrationStep, MigrationSummary } from '$types/Migration';
import { PersistentFlag } from '$types/persistent';

import type { ConfigService, LogService, PersistentService } from '../index';
import { generateHashInfo } from './GroupHashGenerator';
import { generateMigrationFile, generateMigrationSteps } from './Migration';
import { generateTSTypeFileContent, generateTSZodFileContent } from './TSFileGenerator';

type FlagServiceParameters = {
	configService: ConfigService;
	persistentService: PersistentService;
	logService: LogService;
};

type FlagTypeDescriptor = {
	tsFileContent: string;
	zodFileContent: string;
	groupTypeHash: Map<string, string>;
};

let flags: Record<string, PersistentFlag> | undefined;
let flagWatcher: PersistentEngineWatcherClose | undefined;
let flagTypeDescriptor: FlagTypeDescriptor | undefined;

export const FlagService = ({
	configService,
	persistentService,
	logService
}: FlagServiceParameters) => {
	const log = logService('flag');
	const logWatch = logService('flag-watch');

	const accessFlags = async (): Promise<Record<string, PersistentFlag>> => {
		if (flags === undefined) {
			const { list } = await persistentService.list('flag');
			flags = list;
			log.info({ count: Object.keys(flags).length }, 'Initialized flags');
		}

		if (flagWatcher === undefined) {
			flagWatcher = await persistentService.watch('flag', (eventType, key, value) => {
				switch (eventType) {
					case 'data':
						{
							if (!key) {
								log.warn({ key }, 'Invalid flag key');
								return;
							}

							if (flags && value)
								try {
									const valueObject = JSON.parse(value);
									const flag = PersistentFlag.parse(valueObject);
									flags[key] = flag;
									logWatch.info({ key }, 'Updated flag');
								} catch {
									log.warn({ key }, 'Failed to parse updated flag value');
								}
							flagTypeDescriptor = undefined;
						}
						break;

					case 'delete':
						{
							if (!key) {
								log.warn({ key }, 'Invalid flag key');
								return;
							}

							if (flags) {
								delete flags[key];
								logWatch.info({ key }, 'Deleted flag');
							}
							flagTypeDescriptor = undefined;
						}
						break;
				}
			});
			log.info('Watching flags');
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
		getFlag: async (key: string): Promise<PersistentFlag | undefined> => {
			const flags = await accessFlags();
			return flags?.[key] ?? undefined;
		},
		getFlags: async (prefix: string): Promise<Record<string, PersistentFlag>> => {
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
		},
		getMigrationFileContent: async (): Promise<MigrationFile> => {
			const flags = await accessFlags();
			return generateMigrationFile(configService.environment, flags);
		},
		prepareMigration: async (migrationFile: MigrationFile): Promise<MigrationSummary> => {
			const flags = await accessFlags();
			return generateMigrationSteps(migrationFile, flags);
		},
		executeMigration: async (migrations: MigrationStep[]) => {
			for (const step of migrations)
				if (step.dependentId && !migrations.some((s) => s.id === step.dependentId))
					throw new Error(
						`Dependent step with id ${step.dependentId} not found for step ${step.id}`
					);

			for (const step of migrations)
				switch (step.mode) {
					case 'CREATE_DEFAULTVALUE':
						await persistentService.throwIfExists('flag', step.flagKey);
						if ('valueExists' in step.flag) step.flag.valueExists = false;
						await persistentService.put('flag', step.flagKey, step.flag);
						break;
					case 'UPDATE_SCHEMA_DEFAULTVALUE':
						await persistentService.throwIfNotExists('flag', step.flagKey);
						if ('valueExists' in step.flag) step.flag.valueExists = false;
						await persistentService.overwrite('flag', step.flagKey, step.flag);
						break;
					case 'SET_VALUE':
						await persistentService.throwIfNotExists('flag', step.flagKey);
						if ('value' in step.flag)
							await persistentService.overwrite('flag', step.flagKey, {
								value: step.flag.value,
								valueExists: step.flag.valueExists
							});
						break;
					case 'DELETE':
						await persistentService.delete('flag', step.flagKey);
						break;
				}
		}
	};
};
export type FlagService = ReturnType<typeof FlagService>;

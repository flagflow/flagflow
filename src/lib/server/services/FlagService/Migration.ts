import { isEqualFlagSchema, isEqualFlagValue } from '$lib/flagHandler/flagComparer';
import { flagSchemaValidator, flagValueValidator } from '$lib/flagHandler/flagValidator';
import { type EtcdFlag, EtcdFlagKey } from '$types/etcd';
import type { MigrationFile, MigrationStep, MigrationSummary } from '$types/Migration';

export const generateMigrationFile = (
	environment: string,
	flags: Record<string, EtcdFlag>
): MigrationFile => {
	const createdAt = new Date();
	const version = __APP_VERSION__;

	return {
		environment,
		version,
		createdAt,
		flags
	};
};

export const generateMigrationSteps = (
	migrationFile: MigrationFile,
	existingFlags: Record<string, EtcdFlag>
): MigrationSummary => {
	for (const [key, flag] of Object.entries(migrationFile.flags)) {
		if (!EtcdFlagKey.safeParse(key).success)
			throw new Error(`Invalid flag key "${key}" in migration file`);
		const schemaError = flagSchemaValidator(flag);
		if (schemaError)
			throw new Error(`Invalid flag schema in migration file for "${key}": ${schemaError}`);
		const valueError = flagValueValidator(flag);
		if (valueError)
			throw new Error(`Invalid flag value in migration file for "${key}": ${valueError}`);
	}

	let id = 1;
	const steps: MigrationStep[] = [];
	for (const [migrationKey, migrationFlag] of Object.entries(migrationFile.flags)) {
		const existingFlag = existingFlags[migrationKey];
		if (!existingFlag) {
			steps.push({
				id: id++,
				mode: 'CREATE_DEFAULTVALUE',
				flagKey: migrationKey,
				flag: migrationFile.flags[migrationKey]
			});
			if ('value' in migrationFlag)
				steps.push({
					id: id++,
					mode: 'SET_VALUE',
					flagKey: migrationKey,
					flag: migrationFile.flags[migrationKey],
					dependentId: id - 2,
					indent: 1
				});
		} else if (existingFlag.type !== migrationFlag.type) {
			steps.push(
				{ id: id++, mode: 'DELETE', flagKey: migrationKey },
				{
					id: id++,
					mode: 'CREATE_DEFAULTVALUE',
					flagKey: migrationKey,
					flag: migrationFile.flags[migrationKey],
					dependentId: id - 2,
					indent: 1
				}
			);
			if ('value' in migrationFlag)
				steps.push({
					id: id++,
					mode: 'SET_VALUE',
					flagKey: migrationKey,
					flag: migrationFile.flags[migrationKey],
					dependentId: id - 2,
					indent: 2
				});
		} else if (!isEqualFlagSchema(existingFlag, migrationFlag)) {
			steps.push({
				id: id++,
				mode: 'UPDATE_SCHEMA_DEFAULTVALUE',
				flagKey: migrationKey,
				flag: migrationFile.flags[migrationKey]
			});
			if ('value' in migrationFlag)
				steps.push({
					id: id++,
					mode: 'SET_VALUE',
					flagKey: migrationKey,
					flag: migrationFile.flags[migrationKey],
					dependentId: id - 2,
					indent: 1
				});
		} else if (!isEqualFlagValue(existingFlag, migrationFlag))
			steps.push({
				id: id++,
				mode: 'SET_VALUE',
				flagKey: migrationKey,
				flag: migrationFile.flags[migrationKey]
			});
	}
	for (const flagKey of Object.keys(existingFlags)) {
		const migrationFlag = migrationFile.flags[flagKey];
		if (!migrationFlag) steps.push({ id: id++, mode: 'DELETE', flagKey });
	}

	return {
		environment: migrationFile.environment,
		version: migrationFile.version,
		createdAt: migrationFile.createdAt,
		steps
	};
};

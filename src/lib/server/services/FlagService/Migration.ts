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
	flags: Record<string, EtcdFlag>
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

	const steps: MigrationStep[] = [];
	for (const migrationKey of Object.keys(migrationFile.flags)) {
		const flag = flags[migrationKey];
		if (!flag) steps.push({ mode: 'create', name: migrationKey });
	}
	for (const flagKey of Object.keys(flags)) {
		const migrationFlag = migrationFile.flags[flagKey];
		if (!migrationFlag) steps.push({ mode: 'delete', name: flagKey });
	}

	return {
		environment: migrationFile.environment,
		version: migrationFile.version,
		createdAt: migrationFile.createdAt,
		steps
	};
};

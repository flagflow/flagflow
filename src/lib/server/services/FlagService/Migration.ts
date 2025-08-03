import type { EtcdFlag } from '$types/etcd';
import type { MigrationFile } from '$types/Migration';

export const generateMigration = (
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

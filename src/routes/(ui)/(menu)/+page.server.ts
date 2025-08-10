import { basename, dirname } from '$lib/pathEx';
import type { EtcdFlag } from '$types/etcd';
import { etcdRecordToArray } from '$types/etcd';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { container } }) => {
	const maintenanceService = container.resolve('maintenanceService');
	const isDefaultUserExists = await maintenanceService.isDefaultUserExistsWithoutModification();

	const flagService = container.resolve('flagService');

	const flagGroups = await flagService.getFlagGroups();

	const flagsAsRecord = await flagService.list();
	const flags = etcdRecordToArray<EtcdFlag>(flagsAsRecord);

	// Filter only boolean flags that are killswitches
	const killSwitchFlags = flags
		.filter((flag) => flag.type === 'BOOLEAN' && flag.isKillSwitch)
		.sort((a, b) => a.key.localeCompare(b.key))
		.map((flag) => ({
			...flag,
			flagGroup: dirname(flag.key),
			flagName: basename(flag.key)
		}));

	return {
		isDefaultUserExists,
		killSwitchFlags,
		totalFlagsCount: flags.length,
		killSwitchCount: killSwitchFlags.length,
		totalGroupsCount: flagGroups.length
	};
};

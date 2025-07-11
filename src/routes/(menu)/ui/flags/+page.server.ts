import { basename, dirname } from '$lib/pathEx';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const flags = await rpcCaller.flag.getList();
	const flagsEx = flags.map((flag) => ({
		...flag,

		groupName: dirname(flag.key),
		flagName: basename(flag.key),

		typeToDisplay:
			flag.type === 'BOOLEAN' ? (flag.isKillSwitch ? 'KILL-SWITCH' : 'BOOLEAN') : flag.type,
		valueToDisplay: flag.valueExists ? flag.value : flag.defaultValue
	}));

	const flagGroups = Object.fromEntries(
		Object.entries(
			flagsEx.reduce(
				(groups, flag) => {
					const group = groups[flag.groupName] || [];
					group.push(flag);
					groups[flag.groupName] = group;
					return groups;
				},
				{} as Record<string, typeof flagsEx>
			)
		)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([groupName, flags]) => [
				groupName,
				[...flags].sort((a, b) => a.flagName.localeCompare(b.flagName))
			])
	);

	return {
		flagGroups,
		flagCount: flags.length
	};
};

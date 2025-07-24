import { basename, dirname } from '$lib/pathEx';
import { capitalize } from '$lib/stringEx';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const flags = await rpcCaller.flag.getList();
	const flagsEx = flags
		.sort((a, b) => a.key.localeCompare(b.key))
		.map((flag) => ({
			...flag,

			groupName: dirname(flag.key),
			flagName: basename(flag.key),

			typeToDisplay: capitalize(
				flag.type === 'BOOLEAN' ? (flag.isKillSwitch ? 'KILL SWITCH' : 'BOOLEAN') : flag.type
			)
		}));

	const flagGroups = Object.entries(
		flagsEx.reduce(
			(groups, flag) => {
				const group = groups[flag.groupName] || [];
				group.push(flag);
				groups[flag.groupName] = group;
				return groups;
			},
			{} as Record<string, typeof flagsEx>
		)
	).sort(([a], [b]) => a.localeCompare(b));

	return {
		flagCount: flags.length,
		flagGroups,
		flagGroupKeys: flagGroups.map(([group]) => group)
	};
};

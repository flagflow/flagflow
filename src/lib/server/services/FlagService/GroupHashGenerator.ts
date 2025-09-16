import { createHash } from 'node:crypto';

import { flagHashInfo } from '$lib/flagHandler/flagTypescript';
import { sortObjectByKey } from '$lib/objectEx';
import type { PersistentFlag } from '$types/persistent';

export const generateHashInfo = (flags: Record<string, PersistentFlag>): Map<string, string> => {
	const groups: Map<string, Record<string, PersistentFlag | string>> = new Map();

	// Generate groups
	for (const [key, flag] of Object.entries(flags)) {
		const keyParts = key.split('/');
		const name = keyParts.at(-1);
		const groupParts = keyParts.slice(0, -1);
		if (!name) continue;

		const groupName = groupParts.join('__');
		if (!groups.has(groupName)) groups.set(groupName, {});
		groups.get(groupName)![name] = flag;
		if (groupParts.length > 0) {
			const subGroupName = groupParts.slice(0, -1).join('__');
			if (!groups.has(subGroupName)) groups.set(subGroupName, {});
			groups.get(subGroupName)![groupParts.at(-1) || ''] = groupParts.join('__');
		}
	}

	// Calculate hashes for each group, use recursive approach if needed
	const generateGroupHash = (groupName: string): string => {
		const hashInfo: string[] = [];

		for (const [flagName, flag] of Object.entries(sortObjectByKey(groups.get(groupName) || {})))
			if (typeof flag === 'string')
				hashInfo.push(flagName, generateGroupHash((groupName ? groupName + '__' : '') + flagName));
			else hashInfo.push(flagName, flagHashInfo(flag));

		return createHash('sha1').update(hashInfo.join('\n')).digest('hex');
	};

	const result: Map<string, string> = new Map();
	for (const groupName of [...groups.keys()].toSorted())
		result.set(groupName, generateGroupHash(groupName));
	return result;
};

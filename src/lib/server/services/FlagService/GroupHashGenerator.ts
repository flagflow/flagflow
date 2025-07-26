import { createHash } from 'node:crypto';

import { sortMapByKey, sortObjectByKey } from '$lib/objectEx';
import type { EtcdFlagObject } from '$types/etcd/flagObject';

const generateGroupHash = (flags: Record<string, EtcdFlagObject>, groupName: string): string => {
	const hashInfo: string[] = [];

	hashInfo.push(groupName);

	// const typeName = ROOT_TYPE_NAME + (groupName ? `_${capitalizeWords(groupName, '_')}` : '');
	// hashInfo.push(`export type ${typeName} = {`);
	// for (const [flagName, flag] of Object.entries(sortObjectByKey(groupFlags))) {
	// 	if (typeof flag === 'string') {
	// 		const subTypeName = ROOT_TYPE_NAME + (flag ? `_${capitalizeWords(flag, '_')}` : '');
	// 		hashInfo.push(`\t${flagName}: ${subTypeName};`);
	// 	} else {
	// 		hashInfo.push(`\t/**`);
	// 		if (flag.description) hashInfo.push(`\t* ${flag.description}`);
	// 		hashInfo.push(
	// 			`\t* @default ${flag.defaultValue}`,
	// 			`\t*/`
	// 		);
	// 		const type = flag.getTypescriptType();
	// 		hashInfo.push(`\t${flagName}: ${type};`);
	// 	}
	// }

	return createHash('sha1').update(hashInfo.join('\n')).digest('hex');
};

export const generateHashInfo = (flags: Record<string, EtcdFlagObject>): Map<string, string> => {
	const groups: Map<string, string> = new Map();

	for (const key of Object.keys(flags)) {
		const keyParts = key.split('/');
		const groupParts = keyParts.slice(0, -1);
		const groupName = groupParts.join('/');

		if (!groups.has(groupName)) groups.set(groupName, generateGroupHash(flags, groupName));
	}

	return sortMapByKey(groups);
};

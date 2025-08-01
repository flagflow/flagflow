import type { EtcdFlagObject } from '$types/etcd/flagObject';

export const formatFlagApiResponseJson = (flags: Record<string, EtcdFlagObject>): object => {
	const result: Record<string, unknown> = {};

	for (const [key, flag] of Object.entries(flags)) {
		const keyParts = key.split('/');
		const name = keyParts.at(-1);
		const groupParts = keyParts.slice(0, -1);
		if (!name) continue;

		let position = result;
		if (groupParts.length > 0)
			for (const part of groupParts) {
				if (!position[part]) position[part] = {};
				position = position[part] as Record<string, unknown>;
			}
		position[name] = flag.getDisplayValue().value;
	}
	return result;
};

export const formatFlagApiResponseENV = (flags: Record<string, EtcdFlagObject>): string[] => {
	const result: string[] = [];
	for (const [key, flag] of Object.entries(flags)) {
		const value = flag.getDisplayValue().value;
		result.push(`${key}=${value}`);
	}
	result.sort();
	return result;
};

export const formatFlagApiMapResponseENV = (flags: Record<string, string>): string[] => {
	const result: string[] = [];
	for (const [key, group] of Object.entries(flags)) result.push(`${key}=${group}`);
	result.sort();
	return result;
};

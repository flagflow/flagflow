import type { EtcdFlag } from '$types/etcd';

export const formatFlagApiResponseJson = (flags: Record<string, EtcdFlag>): object => {
	const result: Record<string, unknown> = {};

	for (const [key, flag] of Object.entries(flags)) {
		const keyParts = key.split('/');
		const name = keyParts.at(-1);
		const path = keyParts.slice(0, -1).join('/');
		const pathParts = path.split('/');
		if (!name) continue;

		let position = result;
		if (path)
			for (const part of pathParts) {
				if (!position[part]) position[part] = {};
				position = position[part] as Record<string, unknown>;
			}
		position[name] = flag.valueExists ? flag.value : flag.defaultValue;
	}
	return result;
};

export const formatFlagApiResponseENV = (flags: Record<string, EtcdFlag>): string => {
	const result: string[] = [];
	for (const [key, flag] of Object.entries(flags)) {
		const value = flag.valueExists ? flag.value : flag.defaultValue;
		result.push(`${key}=${value}`);
	}
	return result.join('\n');
};

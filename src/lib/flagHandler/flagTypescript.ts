import type { EtcdFlag } from '$types/etcd';

export const flagTypescriptType = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return 'boolean';
		case 'INTEGER':
			return 'number';
		case 'STRING':
			return 'string';
		case 'ENUM':
			return `${[...flag.enumValues]
				.sort()
				.map((v) => JSON.stringify(v))
				.join(' | ')}`;
		case 'TAG':
			return `(${[...flag.tagValues]
				.sort()
				.map((v) => JSON.stringify(v))
				.join(' | ')})[]`;
		case 'AB-TEST':
			return 'string';
		default:
			return 'never';
	}
};

export const flagHashInfo = (flag: EtcdFlag): string => {
	return flagTypescriptType(flag);
};

export const flagTypescriptDefaultValue = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return flag.defaultValue ? 'true' : 'false';
		case 'INTEGER':
			return flag.defaultValue.toString();
		case 'STRING':
			return JSON.stringify(flag.defaultValue);
		case 'ENUM':
			return JSON.stringify(flag.defaultValue);
		case 'TAG':
			return `[${[...flag.defaultValue]
				.sort()
				.map((v) => JSON.stringify(v))
				.join(', ')}]`;
		case 'AB-TEST':
			return JSON.stringify('A');
		default:
			return 'never';
	}
};

export const flagTypescriptZodMethod = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return 'z.boolean()';
		case 'INTEGER':
			return 'z.number()';
		case 'STRING':
			return 'z.string()';
		case 'ENUM':
			return `z.enum([${[...flag.enumValues]
				.sort()
				.map((v) => JSON.stringify(v))
				.join(', ')}])`;
		case 'TAG':
			return `z.array(z.enum([${[...flag.tagValues]
				.sort()
				.map((v) => JSON.stringify(v))
				.join(', ')}]))`;
		case 'AB-TEST':
			return 'z.string()';
		default:
			return 'never';
	}
};

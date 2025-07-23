import type { EtcdFlag } from '$types/etcd';

export const flagSchemaToString = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return 'true/false';
		case 'INTEGER':
			return `${flag.minValue} - ${flag.maxValue}`;
		case 'STRING':
			return [flag.maxLength > 0 ? `max ${flag.maxLength} chars` : '', flag.regExp ? 'format' : '']
				.filter(Boolean)
				.join(' + ')
				.trim();
		case 'ENUM':
			return `${flag.allowEmpty ? '0 or ' : ''}1 from ${flag.enumValues.length}`.trim();
		case 'TAG': {
			const intervals = [
				flag.minCount > 0 ? `${flag.minCount}` : '0',
				flag.maxCount > 0 ? `${flag.maxCount}` : `${flag.tagValues.length}`
			];
			return `${intervals.join('...')} from ${flag.tagValues.length}`.trim();
		}
		default:
			return 'Unknown flag type';
	}
};

export const flagDefaultValueToString = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return flag.defaultValue ? 'true' : 'false';
		case 'INTEGER':
			return `${flag.defaultValue}`;
		case 'STRING':
			return `"${flag.defaultValue}"`;
		case 'ENUM':
			return `(${flag.defaultValue})`;
		case 'TAG': {
			const defaultValue = [...flag.defaultValue];
			defaultValue.sort();
			return `[${defaultValue.join(', ')}]`;
		}
		default:
			return 'Unknown flag type';
	}
};

export const flagValueToString = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return (flag.valueExists ? flag.value : flag.defaultValue) ? 'true' : 'false';
		case 'INTEGER':
			return `${flag.valueExists ? flag.value : flag.defaultValue}`;
		case 'STRING':
			return `"${flag.valueExists ? flag.value : flag.defaultValue}"`;
		case 'ENUM':
			return `(${flag.valueExists ? flag.value : flag.defaultValue})`;
		case 'TAG': {
			const defaultValue = [...(flag.valueExists ? flag.value : flag.defaultValue)];
			defaultValue.sort();
			return `[${defaultValue.join(', ')}]`;
		}
		default:
			return 'Unknown flag type';
	}
};

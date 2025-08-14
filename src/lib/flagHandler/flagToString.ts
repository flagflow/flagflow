import type { PersistentFlag } from '$types/persistent';

export const flagSchemaToString = (flag: PersistentFlag): string => {
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
		case 'AB-TEST':
			return `Chance B: ${flag.chanceBPercent}%`;
		default:
			return 'Unknown flag type';
	}
};

export const flagDefaultValueToString = (flag: PersistentFlag): string => {
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

export const flagValueToString = (
	flag: PersistentFlag
): {
	isDefaultValue: boolean;
	value: string | number | boolean | string[];
} => {
	switch (flag.type) {
		case 'BOOLEAN':
			return {
				isDefaultValue: !flag.valueExists,
				value: flag.valueExists ? flag.value : flag.defaultValue
			};
		case 'INTEGER':
			return {
				isDefaultValue: !flag.valueExists,
				value: flag.valueExists ? flag.value : flag.defaultValue
			};
		case 'STRING':
			return {
				isDefaultValue: !flag.valueExists,
				value: flag.valueExists ? flag.value : flag.defaultValue
			};
		case 'ENUM':
			return {
				isDefaultValue: !flag.valueExists,
				value: flag.valueExists ? flag.value : flag.defaultValue
			};
		case 'TAG':
			return {
				isDefaultValue: !flag.valueExists,
				value: flag.valueExists ? flag.value : flag.defaultValue
			};
		case 'AB-TEST':
			return {
				isDefaultValue: false,
				value: Math.random() * 100 < flag.chanceBPercent ? 'B' : 'A'
			};
		default:
			return { isDefaultValue: false, value: 'unknown' };
	}
};

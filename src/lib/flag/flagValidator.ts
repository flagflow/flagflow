import type { EtcdFlag } from '$types/etcd';

export const flagSchemaToString = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return 'true/false';
		case 'INTEGER':
			return `${flag.minValue} - ${flag.maxValue}`;
		case 'STRING':
			return '';
		default:
			return 'Unknown flag type';
	}
};

export const flagSchemaValidator = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return '';
		case 'INTEGER':
			if (flag.minValue > flag.maxValue)
				return `Minimum value (${flag.minValue}) cannot be greater than maximum value (${flag.maxValue})`;
			else if (flag.defaultValue < flag.minValue || flag.defaultValue > flag.maxValue)
				return `Default value (${flag.defaultValue}) must be between ${flag.minValue} and ${flag.maxValue}`;
			return '';
		case 'STRING':
			return '';
		default:
			return 'Unknown flag type';
	}
};

export const flagValueValidator = (flag: EtcdFlag): string => {
	if (!flag.valueExists) return '';
	switch (flag.type) {
		case 'BOOLEAN':
			return '';
		case 'INTEGER':
			if (flag.value < flag.minValue || flag.value > flag.maxValue)
				return `Value (${flag.value}) must be between ${flag.minValue} and ${flag.maxValue}`;
			if (!Number.isInteger(flag.value)) return 'Value must be an integer';
			return '';
		case 'STRING':
			return '';
		default:
			return 'Unknown flag type';
	}
};

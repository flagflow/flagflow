import type { EtcdFlag } from '$types/etcd';

export const flagSchemaValidator = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return '';
		case 'INTEGER':
			if (flag.minValue > flag.maxValue)
				return 'Minimum value cannot be greater than maximum value';
			else if (flag.defaultValue < flag.minValue || flag.defaultValue > flag.maxValue)
				return `Default value must be between ${flag.minValue} and ${flag.maxValue}`;
			return '';
		case 'STRING':
			return '';
		default:
			return 'Unknown flag type';
	}
};

export const flagValueValidator = (flag: EtcdFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return '';
		case 'INTEGER':
			if (flag.value < flag.minValue || flag.value > flag.maxValue)
				return `Value must be between ${flag.minValue} and ${flag.maxValue}`;
			if (!Number.isInteger(flag.value)) return 'Value must be an integer';
			return '';
		case 'STRING':
			return '';
		default:
			return 'Unknown flag type';
	}
};

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
			if (flag.maxLength < 0) return `Maximum length (${flag.maxLength}) cannot be negative`;
			else if (flag.maxLength > 0 && flag.defaultValue.length > flag.maxLength)
				return `Default value is too long (max ${flag.maxLength} chars)`;
			if (flag.regExp)
				try {
					const regexp = new RegExp(flag.regExp);
					if (!regexp.test(flag.defaultValue))
						return `Default value (${flag.defaultValue}) does not match /${flag.regExp}/`;
				} catch {
					return `Invalid regexp: ${flag.regExp}`;
				}
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
			if (!Number.isInteger(flag.value)) return 'Value must be an integer';
			if (flag.value < flag.minValue || flag.value > flag.maxValue)
				return `Value (${flag.value}) must be between ${flag.minValue} and ${flag.maxValue}`;
			return '';
		case 'STRING':
			if (flag.value.length > flag.maxLength)
				return `Value is too long (max ${flag.maxLength} chars)`;
			if (flag.regExp)
				try {
					const regexp = new RegExp(flag.regExp);
					if (!regexp.test(flag.value))
						return `Value (${flag.value}) does not match /${flag.regExp}/`;
				} catch {
					return `Invalid regexp: ${flag.regExp}`;
				}
			return '';
		default:
			return 'Unknown flag type';
	}
};

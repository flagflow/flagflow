import type { EtcdFlag } from '$types/etcd';

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
		case 'ENUM':
			if (flag.enumValues.length === 0) return 'Enum must have at least one value';
			if (flag.defaultValue.length === 0 && !flag.allowEmpty) return 'Default value is required';
			if (flag.defaultValue.length > 0 && !flag.enumValues.includes(flag.defaultValue))
				return `Default value (${flag.defaultValue}) must be one of the enum values`;
			return '';
		case 'TAG':
			if (flag.tagValues.length === 0) return 'Tag must have at least one value';
			if (flag.minCount > 0 && flag.tagValues.length < flag.minCount)
				return `Minimum tag values count (${flag.minCount}) cannot be greater than available tag values (${flag.tagValues.length})`;
			if (flag.minCount > 0 && flag.defaultValue.length < flag.minCount)
				return `Default value must have at least ${flag.minCount} tags`;
			if (flag.maxCount > 0 && flag.defaultValue.length > flag.maxCount)
				return `Default value must have at most ${flag.maxCount} tags`;
			if (!flag.defaultValue.every((tag) => flag.tagValues.includes(tag)))
				return `Allowed values for tags: ${flag.tagValues.join(', ')}`;
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
		case 'ENUM':
			if (flag.value.length === 0 && !flag.allowEmpty) return 'Value is required';
			if (flag.value.length > 0 && !flag.enumValues.includes(flag.value))
				return `Value (${flag.value}) must be one of the enum values`;
			return '';
		case 'TAG':
			if (flag.minCount > 0 && flag.value.length < flag.minCount)
				return `Value must have at least ${flag.minCount} tags`;
			if (flag.maxCount > 0 && flag.value.length > flag.maxCount)
				return `Value must have at most ${flag.maxCount} tags`;
			if (!flag.value.every((tag) => flag.tagValues.includes(tag)))
				return `Allowed values for tags: ${flag.tagValues.join(', ')}`;
			return '';
		default:
			return 'Unknown flag type';
	}
};

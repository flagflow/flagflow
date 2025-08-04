import type { EtcdFlag } from '$types/etcd';

export const isEqualFlagSchema = (current: EtcdFlag, override: EtcdFlag): boolean => {
	if (current.type !== override.type) return false;

	if (current.type === 'BOOLEAN' && override.type === 'BOOLEAN')
		return (
			current.isKillSwitch === override.isKillSwitch &&
			current.defaultValue === override.defaultValue
		);
	if (current.type === 'INTEGER' && override.type === 'INTEGER')
		return (
			current.minValue === override.minValue &&
			current.maxValue === override.maxValue &&
			current.defaultValue === override.defaultValue
		);
	if (current.type === 'STRING' && override.type === 'STRING')
		return (
			current.maxLength === override.maxLength &&
			current.regExp === override.regExp &&
			current.defaultValue === override.defaultValue
		);
	if (current.type === 'ENUM' && override.type === 'ENUM')
		return (
			current.enumValues.join(',') === override.enumValues.join(',') &&
			current.allowEmpty === override.allowEmpty &&
			current.defaultValue === override.defaultValue
		);
	if (current.type === 'TAG' && override.type === 'TAG')
		return (
			current.tagValues.join(',') === override.tagValues.join(',') &&
			current.minCount === override.minCount &&
			current.maxCount === override.maxCount &&
			current.defaultValue.join(',') === override.defaultValue.join(',')
		);
	if (current.type === 'AB-TEST' && override.type === 'AB-TEST')
		return current.chanceBPercent === override.chanceBPercent;

	throw new Error(`Unknown flag type: ${current.type}`);
};

export const isEqualFlagValue = (current: EtcdFlag, override: EtcdFlag): boolean => {
	if (current.type !== override.type) return false;

	if (current.type === 'BOOLEAN' && override.type === 'BOOLEAN')
		return current.valueExists === override.valueExists && current.value === override.value;
	if (current.type === 'INTEGER' && override.type === 'INTEGER')
		return current.valueExists === override.valueExists && current.value === override.value;
	if (current.type === 'STRING' && override.type === 'STRING')
		return current.valueExists === override.valueExists && current.value === override.value;
	if (current.type === 'ENUM' && override.type === 'ENUM')
		return current.valueExists === override.valueExists && current.value === override.value;
	if (current.type === 'TAG' && override.type === 'TAG')
		return (
			current.valueExists === override.valueExists &&
			current.value.join(',') === override.value.join(',')
		);
	if (current.type === 'AB-TEST' && override.type === 'AB-TEST') return true;

	throw new Error(`Unknown flag type: ${current.type}`);
};

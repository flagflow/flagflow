import type { PersistentFlag } from '$types/persistent';

export const updateFlagSchema = (
	current: PersistentFlag,
	override: PersistentFlag
): PersistentFlag => {
	if (current.type !== override.type)
		throw new Error(
			`Flag type cannot be changed (current: ${current.type}, new: ${override.type})`
		);

	if (current.type === 'BOOLEAN' && override.type === 'BOOLEAN')
		return {
			...current,
			isKillSwitch: override.isKillSwitch,
			defaultValue: override.defaultValue
		};
	if (current.type === 'INTEGER' && override.type === 'INTEGER')
		return {
			...current,
			minValue: override.minValue,
			maxValue: override.maxValue,
			defaultValue: override.defaultValue
		};
	if (current.type === 'STRING' && override.type === 'STRING')
		return {
			...current,
			maxLength: override.maxLength,
			regExp: override.regExp,
			defaultValue: override.defaultValue
		};
	if (current.type === 'ENUM' && override.type === 'ENUM')
		return {
			...current,
			enumValues: override.enumValues,
			allowEmpty: override.allowEmpty,
			defaultValue: override.defaultValue
		};
	if (current.type === 'TAG' && override.type === 'TAG')
		return {
			...current,
			tagValues: override.tagValues,
			minCount: override.minCount,
			maxCount: override.maxCount,
			defaultValue: override.defaultValue
		};
	if (current.type === 'AB-TEST' && override.type === 'AB-TEST')
		return {
			...current,
			chanceBPercent: override.chanceBPercent
		};

	throw new Error(`Unknown flag type: ${current.type}`);
};

export const updateFlagValue = (
	current: PersistentFlag,
	override: PersistentFlag
): PersistentFlag => {
	if (current.type !== override.type)
		throw new Error(
			`Flag type cannot be changed (current: ${current.type}, new: ${override.type})`
		);

	if (current.type === 'BOOLEAN' && override.type === 'BOOLEAN')
		return {
			...current,
			valueExists: override.valueExists,
			value: override.value
		};
	if (current.type === 'INTEGER' && override.type === 'INTEGER')
		return {
			...current,
			valueExists: override.valueExists,
			value: override.value
		};
	if (current.type === 'STRING' && override.type === 'STRING')
		return {
			...current,
			valueExists: override.valueExists,
			value: override.value
		};
	if (current.type === 'ENUM' && override.type === 'ENUM')
		return {
			...current,
			valueExists: override.valueExists,
			value: override.value
		};
	if (current.type === 'TAG' && override.type === 'TAG')
		return {
			...current,
			valueExists: override.valueExists,
			value: override.value
		};
	if (current.type === 'AB-TEST' && override.type === 'AB-TEST')
		return {
			...current
		};

	throw new Error(`Unknown flag type: ${current.type}`);
};

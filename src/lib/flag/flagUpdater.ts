import type { EtcdFlag } from '$types/etcd';

export const updateFlagSchema = (current: EtcdFlag, input: EtcdFlag): EtcdFlag => {
	if (current.type !== input.type)
		throw new Error(`Flag type cannot be changed (current: ${current.type}, new: ${input.type})`);

	if (current.type === 'BOOLEAN' && input.type === 'BOOLEAN')
		return {
			...current,
			isKillSwitch: input.isKillSwitch,
			defaultValue: input.defaultValue
		};
	if (current.type === 'INTEGER' && input.type === 'INTEGER')
		return {
			...current,
			minValue: input.minValue,
			maxValue: input.maxValue,
			defaultValue: input.defaultValue
		};
	if (current.type === 'STRING' && input.type === 'STRING')
		return {
			...current,
			maxLength: input.maxLength,
			regExp: input.regExp,
			defaultValue: input.defaultValue
		};
	if (current.type === 'ENUM' && input.type === 'ENUM')
		return {
			...current,
			enumValues: input.enumValues,
			defaultValue: input.defaultValue
		};

	throw new Error(`Unknown flag type: ${current.type}`);
};

export const updateFlagValue = (current: EtcdFlag, input: EtcdFlag): EtcdFlag => {
	if (current.type !== input.type)
		throw new Error(`Flag type cannot be changed (current: ${current.type}, new: ${input.type})`);

	if (current.type === 'BOOLEAN' && input.type === 'BOOLEAN')
		return {
			...current,
			valueExists: input.valueExists,
			value: input.value
		};
	if (current.type === 'INTEGER' && input.type === 'INTEGER')
		return {
			...current,
			valueExists: input.valueExists,
			value: input.value
		};
	if (current.type === 'STRING' && input.type === 'STRING')
		return {
			...current,
			valueExists: input.valueExists,
			value: input.value
		};
	if (current.type === 'ENUM' && input.type === 'ENUM')
		return {
			...current,
			valueExists: input.valueExists,
			value: input.value
		};

	throw new Error(`Unknown flag type: ${current.type}`);
};

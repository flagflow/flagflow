export const EMPTY_BOOLEAN_FLAG = {
	description: '',
	type: 'BOOLEAN',
	defaultValue: false,
	isKillSwitch: false,
	valueExists: false,
	value: false
} as const;

export const EMPTY_INTEGER_FLAG = {
	description: '',
	type: 'INTEGER',
	defaultValue: 0,
	minValue: 0,
	maxValue: 1000,
	valueExists: false,
	value: 0
} as const;

export const EMPTY_STRING_FLAG = {
	description: '',
	type: 'STRING',
	defaultValue: '',
	valueExists: false,
	value: ''
} as const;

export const EMPTY_ENUM_FLAG = {
	description: '',
	type: 'ENUM',
	enumValues: [],
	defaultValue: '',
	valueExists: false,
	value: ''
} as const;

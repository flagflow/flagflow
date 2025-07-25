import type { EtcdFlag } from './flag';

const ENUM_DEFAULT_VALUES = ['one', 'two', 'three'] as const;

export const EMPTY_BOOLEAN_FLAG: EtcdFlag = {
	description: '',
	type: 'BOOLEAN',
	defaultValue: false,
	isKillSwitch: false,

	valueExists: false,
	value: false
} as const;

export const EMPTY_INTEGER_FLAG: EtcdFlag = {
	description: '',
	type: 'INTEGER',
	defaultValue: 0,
	minValue: 0,
	maxValue: 1000,

	valueExists: false,
	value: 0
} as const;

export const EMPTY_STRING_FLAG: EtcdFlag = {
	description: '',
	type: 'STRING',
	defaultValue: '',
	maxLength: 0,
	regExp: '',

	valueExists: false,
	value: ''
} as const;

export const EMPTY_ENUM_FLAG: EtcdFlag = {
	description: '',
	type: 'ENUM',
	defaultValue: ENUM_DEFAULT_VALUES[0],
	enumValues: [...ENUM_DEFAULT_VALUES],
	allowEmpty: false,

	valueExists: false,
	value: ''
} as const;

export const EMPTY_TAG_FLAG: EtcdFlag = {
	description: '',
	type: 'TAG',
	defaultValue: [ENUM_DEFAULT_VALUES[0]],
	tagValues: [...ENUM_DEFAULT_VALUES],
	minCount: 1,
	maxCount: 0,

	valueExists: false,
	value: []
} as const;

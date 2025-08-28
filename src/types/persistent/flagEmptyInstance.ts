import type { PersistentFlag } from './flag';

const ENUM_DEFAULT_VALUES = ['one', 'two', 'three'] as const;

export const EMPTY_BOOLEAN_FLAG: PersistentFlag = {
	description: '',
	type: 'BOOLEAN',
	defaultValue: false,
	isKillSwitch: false,

	valueExists: false,
	value: false
} as const;

export const EMPTY_INTEGER_FLAG: PersistentFlag = {
	description: '',
	type: 'INTEGER',
	defaultValue: 0,
	minValue: 0,
	maxValue: 1000,

	valueExists: false,
	value: 0
} as const;

export const EMPTY_STRING_FLAG: PersistentFlag = {
	description: '',
	type: 'STRING',
	defaultValue: '',
	maxLength: 0,
	regExp: '',

	valueExists: false,
	value: ''
} as const;

export const EMPTY_OBJECT_FLAG: PersistentFlag = {
	description: '',
	type: 'OBJECT',
	schema: String.raw`
{
	server: string,
	port: number
}
	`.trim(),
	defaultValue: String.raw`
{
	server: 'remote',
	port: 8080
}
	`.trim(),

	valueExists: false,
	value: ''
} as const;

export const EMPTY_ENUM_FLAG: PersistentFlag = {
	description: '',
	type: 'ENUM',
	defaultValue: ENUM_DEFAULT_VALUES[0],
	enumValues: [...ENUM_DEFAULT_VALUES],
	allowEmpty: false,

	valueExists: false,
	value: ''
} as const;

export const EMPTY_TAG_FLAG: PersistentFlag = {
	description: '',
	type: 'TAG',
	defaultValue: [ENUM_DEFAULT_VALUES[0]],
	tagValues: [...ENUM_DEFAULT_VALUES],
	minCount: 1,
	maxCount: 0,

	valueExists: false,
	value: []
} as const;

export const EMPTY_AB_FLAG: PersistentFlag = {
	description: '',
	type: 'AB-TEST',

	chanceBPercent: 25
} as const;

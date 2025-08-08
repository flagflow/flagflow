import { z } from 'zod';

import type { IconId } from '$components/Icon.svelte';

const EtcdBaseFlag = z.object({
	description: z.string().trim()
});

const EtcdBooleanFlag = z.object({
	type: z.literal('BOOLEAN'),
	defaultValue: z.boolean(),
	isKillSwitch: z.boolean(),

	valueExists: z.boolean(),
	value: z.boolean()
});
const EtcdIntegerFlag = z.object({
	type: z.literal('INTEGER'),
	defaultValue: z.number().int(),
	minValue: z.number().int(),
	maxValue: z.number().int(),

	valueExists: z.boolean(),
	value: z.number().int()
});
const EtcdStringFlag = z.object({
	type: z.literal('STRING'),
	defaultValue: z.string().trim(),
	maxLength: z.number().int(),
	regExp: z.string().trim(),

	valueExists: z.boolean(),
	value: z.string().trim()
});
const EtcdObjectFlag = z.object({
	type: z.literal('OBJECT'),
	defaultValue: z.string().trim(),
	schema: z.string().trim(),

	valueExists: z.boolean(),
	value: z.string().trim()
});
const EtcdEnumFlag = z.object({
	type: z.literal('ENUM'),
	defaultValue: z.string().trim(),
	enumValues: z.array(z.string().trim()),
	allowEmpty: z.boolean(),

	valueExists: z.boolean(),
	value: z.string().trim()
});
const EtcdTagFlag = z.object({
	type: z.literal('TAG'),
	defaultValue: z.array(z.string().trim()),
	tagValues: z.array(z.string().trim()),
	minCount: z.number().int(),
	maxCount: z.number().int(),

	valueExists: z.boolean(),
	value: z.array(z.string().trim())
});
const EtcdABFlag = z.object({
	type: z.literal('AB-TEST'),

	chanceBPercent: z.number().min(0).max(100)
});

export const EtcdFlag = z.intersection(
	EtcdBaseFlag,
	z.discriminatedUnion('type', [
		EtcdBooleanFlag,
		EtcdIntegerFlag,
		EtcdStringFlag,
		EtcdObjectFlag,
		EtcdEnumFlag,
		EtcdTagFlag,
		EtcdABFlag
	])
);
export type EtcdFlag = z.infer<typeof EtcdFlag>;
export type EtcdFlagType = EtcdFlag['type'];

export const EtcdFlagTypeDescription: Record<EtcdFlagType, { text: string; enabled: boolean }> = {
	BOOLEAN: { text: 'On/off functionality or kill switch', enabled: true },
	INTEGER: { text: 'Integer value, can be bounded', enabled: true },
	STRING: { text: 'Text value with optional length or format restrictions', enabled: true },
	OBJECT: { text: 'Structured data, like a JSON object', enabled: false },
	ENUM: { text: 'Select one element from a string valueset', enabled: true },
	TAG: { text: 'Select none, one or more elements from a string valueset', enabled: true },
	'AB-TEST': { text: 'Randomly select one of A and B', enabled: true }
};

export const EtcdFlagTypeIcon: Record<EtcdFlagType, IconId> = {
	BOOLEAN: 'boolean',
	INTEGER: 'integer',
	STRING: 'string',
	OBJECT: 'object',
	ENUM: 'enum',
	TAG: 'tag',
	'AB-TEST': 'abTest'
};

export { EtcdHierarchicalKey as EtcdFlagKey } from './base';

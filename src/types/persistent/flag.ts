import { z } from 'zod';

import type { IconId } from '$components/Icon.svelte';

const PersistentBaseFlag = z.object({
	description: z.string().trim()
});

const PersistentBooleanFlag = z.object({
	type: z.literal('BOOLEAN'),
	defaultValue: z.boolean(),
	isKillSwitch: z.boolean(),

	valueExists: z.boolean(),
	value: z.boolean()
});
const PersistentIntegerFlag = z.object({
	type: z.literal('INTEGER'),
	defaultValue: z.number().int(),
	minValue: z.number().int(),
	maxValue: z.number().int(),

	valueExists: z.boolean(),
	value: z.number().int()
});
const PersistentStringFlag = z.object({
	type: z.literal('STRING'),
	defaultValue: z.string().trim(),
	maxLength: z.number().int(),
	regExp: z.string().trim(),

	valueExists: z.boolean(),
	value: z.string().trim()
});
const PersistentObjectFlag = z.object({
	type: z.literal('OBJECT'),
	defaultValue: z.string().trim(),
	schema: z.string().trim(),

	valueExists: z.boolean(),
	value: z.string().trim()
});
const PersistentEnumFlag = z.object({
	type: z.literal('ENUM'),
	defaultValue: z.string().trim(),
	enumValues: z.array(z.string().trim()),
	allowEmpty: z.boolean(),

	valueExists: z.boolean(),
	value: z.string().trim()
});
const PersistentTagFlag = z.object({
	type: z.literal('TAG'),
	defaultValue: z.array(z.string().trim()),
	tagValues: z.array(z.string().trim()),
	minCount: z.number().int(),
	maxCount: z.number().int(),

	valueExists: z.boolean(),
	value: z.array(z.string().trim())
});
const PersistentABFlag = z.object({
	type: z.literal('AB-TEST'),

	chanceBPercent: z.number().min(0).max(100)
});

export const PersistentFlag = z.intersection(
	PersistentBaseFlag,
	z.discriminatedUnion('type', [
		PersistentBooleanFlag,
		PersistentIntegerFlag,
		PersistentStringFlag,
		PersistentObjectFlag,
		PersistentEnumFlag,
		PersistentTagFlag,
		PersistentABFlag
	])
);
export type PersistentFlag = z.infer<typeof PersistentFlag>;
export type PersistentFlagType = PersistentFlag['type'];

export const PersistentFlagTypeDescription: Record<
	PersistentFlagType,
	{ text: string; enabled: boolean }
> = {
	BOOLEAN: { text: 'On/off functionality or kill switch', enabled: true },
	INTEGER: { text: 'Integer value, can be bounded', enabled: true },
	STRING: { text: 'Text value with optional length or format restrictions', enabled: true },
	OBJECT: { text: 'Structured data, like a JSON object', enabled: false },
	ENUM: { text: 'Select one element from a string valueset', enabled: true },
	TAG: { text: 'Select none, one or more elements from a string valueset', enabled: true },
	'AB-TEST': { text: 'Randomly select one of A and B', enabled: true }
};

export const PersistentFlagTypeIcon: Record<PersistentFlagType, IconId> = {
	BOOLEAN: 'boolean',
	INTEGER: 'integer',
	STRING: 'string',
	OBJECT: 'object',
	ENUM: 'enum',
	TAG: 'tag',
	'AB-TEST': 'abTest'
};

export { PersistentHierarchicalKey as PersistentFlagKey } from './base';

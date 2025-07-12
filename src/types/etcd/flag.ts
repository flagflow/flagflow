import { z } from 'zod';

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

	valueExists: z.boolean(),
	value: z.string().trim()
});
const EtcdTagFlag = z.object({
	type: z.literal('TAG'),
	defaultValue: z.string().trim(),
	tagValues: z.array(z.string().trim()),

	valueExists: z.boolean(),
	value: z.array(z.string().trim())
});
const EtcdABFlag = z.object({
	type: z.literal('AB-TEST'),
	defaultValue: z.string().trim(),
	tagValues: z.array(z.string().trim()),

	valueExists: z.boolean(),
	value: z.array(z.string().trim())
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

export const EtcdFlagTypeDescription: Record<EtcdFlagType, string> = {
	BOOLEAN: 'On/off functionality or kill switch',
	INTEGER: 'Integer value, can be bounded',
	STRING: 'Text value with optional format restrictions',
	OBJECT: 'Structured data, like a JSON object',
	ENUM: 'Select one element from a string valueset',
	TAG: 'Select none, one or more elements from a string valueset',
	'AB-TEST': 'Randomly select one of A and B'
};

export { EtcdHierarchicalKey as EtcdFlagKey } from './base';

/*
 * A/B
 * A/B/C
 * TAGS
 */

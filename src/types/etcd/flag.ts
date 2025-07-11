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
const EtcdEnumFlag = z.object({
	type: z.literal('ENUM'),
	defaultValue: z.string().trim(),
	enumValues: z.array(z.string().trim()),

	valueExists: z.boolean(),
	value: z.string().trim()
});

export const EtcdFlag = z.intersection(
	EtcdBaseFlag,
	z.discriminatedUnion('type', [EtcdBooleanFlag, EtcdIntegerFlag, EtcdStringFlag, EtcdEnumFlag])
);
export type EtcdFlag = z.infer<typeof EtcdFlag>;
export type EtcdFlagType = EtcdFlag['type'];

export { EtcdHierarchicalKey as EtcdFlagKey } from './base';

/*
 * A/B
 * A/B/C
 * TAGS
 */

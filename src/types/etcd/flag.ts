import { z } from 'zod';

const EtcdGenericFlag = z.object({
	description: z.string().trim()
});

const EtcdBooleanFlag = z.object({
	type: z.literal('BOOLEAN'),
	value: z.boolean(),
	defaultValue: z.boolean(),

	isKillSwitch: z.boolean()
});
const EtcdIntegerFlag = z.object({
	type: z.literal('INTEGER'),
	value: z.number().int(),
	defaultValue: z.number().int(),

	minValue: z.number().int().optional(),
	maxValue: z.number().int().optional()
});
const EtcdStringFlag = z.object({
	type: z.literal('STRING'),
	value: z.string().trim(),
	defaultValue: z.string().trim()
});
const EtcdEnumFlag = z.object({
	type: z.literal('ENUM'),
	value: z.string().trim(),
	defaultValue: z.string().trim(),

	enumValues: z.array(z.string().trim())
});

export const EtcdFlag = z.intersection(
	EtcdGenericFlag,
	z.union([EtcdBooleanFlag, EtcdIntegerFlag, EtcdStringFlag, EtcdEnumFlag])
);
export type EtcdFlag = z.infer<typeof EtcdFlag>;

export { EtcdHierarchicalKey as EtcdFlagKey } from './base';

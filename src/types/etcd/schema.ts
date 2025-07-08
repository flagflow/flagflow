import type { z } from 'zod';

import { EtcdFlag } from './flag';
import { EtcdSession } from './session';
import { EtcdUser } from './user';

export type EtcdAnyObject = EtcdUser | EtcdSession | EtcdFlag;
export const EtcdSchema = {
	session: EtcdSession,
	user: EtcdUser,
	flag: EtcdFlag
} as const;
export type EtcdSchemaKey = keyof typeof EtcdSchema;
export type EtcdSchemaDataType<K extends EtcdSchemaKey> = z.infer<(typeof EtcdSchema)[K]>;
export type EtcdSchemaDataTypeWithKey<K extends EtcdSchemaKey> = {
	key: string;
} & EtcdSchemaDataType<K>;

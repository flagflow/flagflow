import type { z } from 'zod';

import { PersistentFlag } from './flag';
import { PersistentSession } from './session';
import { PersistentUser } from './user';

export type PersistentAnyObject = PersistentUser | PersistentSession | PersistentFlag;
export const PersistentSchema = {
	session: PersistentSession,
	user: PersistentUser,
	flag: PersistentFlag
} as const;
export type PersistentSchemaKey = keyof typeof PersistentSchema;
export type PersistentSchemaDataType<K extends PersistentSchemaKey> = z.infer<
	(typeof PersistentSchema)[K]
>;
export type PersistentSchemaDataTypeWithKey<K extends PersistentSchemaKey> = {
	key: string;
} & PersistentSchemaDataType<K>;

import z from 'zod';

import type { ElementType } from '$lib/typeEx';

export const UserRoleZodEnum = z.enum([
	'flag-create',
	'flag-schema',
	'flag-value',
	'users',
	'migration'
]);
export const UserRole = UserRoleZodEnum.options;
export type UserRole = ElementType<typeof UserRole>;

export const USER_ROLES_DESCRIPTOR: Readonly<Record<UserRole, string>> = {
	'flag-create': 'Can create, rename/move, and delete flags',
	'flag-schema': 'Can manage flag schemas',
	'flag-value': 'Can manage flag values',
	users: 'Can add, modify, or remove users and manage sessions',
	migration: 'Can restore backups or execute migrations'
} as const;

export const UserRoleAll = Object.keys(USER_ROLES_DESCRIPTOR) as UserRole[];

export const UserRoleFromArray = (roles: string[]): Readonly<Record<UserRole, boolean>> =>
	({
		'flag-create': roles.includes('flag-create'),
		'flag-schema': roles.includes('flag-schema'),
		'flag-value': roles.includes('flag-value'),
		users: roles.includes('users'),
		migration: roles.includes('migration')
	}) as const;

export const sortUserRoles = (roles: UserRole[]): UserRole[] =>
	roles.sort((a, b) => UserRoleZodEnum.options.indexOf(a) - UserRoleZodEnum.options.indexOf(b));

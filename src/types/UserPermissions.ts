import z from 'zod';

import type { ElementType } from '$lib/typeEx';

export const UserPermissionZodEnum = z.enum([
	'flag-create',
	'flag-schema',
	'flag-value',
	'users',
	'migration'
]);
export const UserPermission = UserPermissionZodEnum.options;
export type UserPermission = ElementType<typeof UserPermission>;

export const USER_PERMISSIONS_DESCRIPTOR: Readonly<Record<UserPermission, string>> = {
	'flag-create': 'Can create, rename/move, and delete flags',
	'flag-schema': 'Can manage flag schemas',
	'flag-value': 'Can manage flag values',
	users: 'Can add, modify, or remove users and manage sessions',
	migration: 'Can restore backups or execute migrations'
} as const;

export const UserPermissionAll = Object.keys(USER_PERMISSIONS_DESCRIPTOR) as UserPermission[];

export const UserPermissionFromArray = (
	permissions: string[]
): Readonly<Record<UserPermission, boolean>> =>
	({
		'flag-create': permissions.includes('flag-create'),
		'flag-schema': permissions.includes('flag-schema'),
		'flag-value': permissions.includes('flag-value'),
		users: permissions.includes('users'),
		migration: permissions.includes('migration')
	}) as const;

export const sortUserPermissions = (permissions: UserPermission[]): UserPermission[] =>
	permissions.toSorted(
		(a, b) => UserPermissionZodEnum.options.indexOf(a) - UserPermissionZodEnum.options.indexOf(b)
	);

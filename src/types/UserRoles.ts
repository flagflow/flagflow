import z from 'zod';

import type { ElementType } from '$lib/typeEx';

export const UserRoleZodEnum = z.enum(['admin', 'maintainer', 'editor', 'viewer']);
export const UserRole = UserRoleZodEnum.options;
export type UserRole = ElementType<typeof UserRole>;

export const USER_ROLES_DESCRIPTOR: Readonly<Record<UserRole, string>> = {
	admin: 'Can manage all aspects of Flagflow, including user management and system settings',
	maintainer:
		'Can manage flags and flag configurations, but has no access to user management or system settings',
	editor: 'Can create and edit flags, but cannot manage flags settings',
	viewer: 'Can view flags and their configurations, but cannot create or edit flags'
} as const;

export const UserRoleFromArray = (roles: string[]): Readonly<Record<UserRole, boolean>> =>
	({
		admin: roles.includes('admin'),
		maintainer: roles.includes('maintainer'),
		editor: roles.includes('editor'),
		viewer: roles.includes('viewer')
	}) as const;

export const UserRolePostfixToColor: Record<UserRole, string> = {
	admin: '!!',
	maintainer: '!',
	editor: '!',
	viewer: ''
};

export const sortUserRoles = (roles: UserRole[]): UserRole[] =>
	roles.sort((a, b) => UserRoleZodEnum.options.indexOf(a) - UserRoleZodEnum.options.indexOf(b));

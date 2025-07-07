import z from 'zod';

export const USER_ROLES_PREFIX = 'flagflow-';
export const USER_ROLES_DESCRIPTOR = {
	'flagflow-admin':
		'Can manage all aspects of Flagflow, including user management and system settings',
	'flagflow-maintainer':
		'Can manage flags and flag configurations, but has no access to user management or system settings',
	'flagflow-editor': 'Can create and edit flags, but cannot manage flags settings',
	'flagflow-viewer': 'Can view flags and their configurations, but cannot create or edit flags'
} as const;

export type UserRole = keyof typeof USER_ROLES_DESCRIPTOR;

export const UserRoleZodEnum = z.enum([
	'flagflow-admin',
	'flagflow-maintainer',
	'flagflow-editor',
	'flagflow-viewer'
]);

export const UserRolePostfixToColor: Record<UserRole, string> = {
	'flagflow-admin': '!!',
	'flagflow-maintainer': '!',
	'flagflow-editor': '!',
	'flagflow-viewer': ''
};

export const sortUserRoles = (soles: UserRole[]): UserRole[] =>
	soles.sort((a, b) => UserRoleZodEnum.options.indexOf(a) - UserRoleZodEnum.options.indexOf(b));

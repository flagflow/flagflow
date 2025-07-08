import {
	sortUserRoles,
	USER_ROLES_PREFIX,
	type UserRole,
	UserRolePostfixToColor
} from '$types/userRoles';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { apiCaller } }) => {
	const users = (await apiCaller.user.getList()).map((user) => ({
		rolesToDisplay: sortUserRoles(user.roles as UserRole[])
			.map((role) => role + UserRolePostfixToColor[role as UserRole])
			.map((role) => role.replace(USER_ROLES_PREFIX, '')),
		...user
	}));
	return {
		users
	};
};

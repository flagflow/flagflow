import {
	sortUserRoles,
	USER_ROLES_PREFIX,
	type UserRole,
	UserRolePostfixToColor
} from '$types/UserRoles';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const users = (await rpcCaller.user.getList()).map((user) => ({
		rolesToDisplay: sortUserRoles(user.roles as UserRole[])
			.map((role) => role + UserRolePostfixToColor[role as UserRole])
			.map((role) => role.replace(USER_ROLES_PREFIX, '')),
		...user
	}));
	return {
		users
	};
};

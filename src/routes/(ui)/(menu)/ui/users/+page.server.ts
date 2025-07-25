import { sortUserRoles, type UserRole, UserRolePostfixToColor } from '$types/UserRoles';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const users = (await rpcCaller.user.getList()).map((user) => ({
		rolesToDisplay: sortUserRoles(user.roles as UserRole[]).map(
			(role) => role + (UserRolePostfixToColor[role as UserRole] || '')
		),
		...user
	}));
	return {
		users
	};
};

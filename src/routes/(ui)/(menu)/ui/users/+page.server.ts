import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller, container } }) => {
	const users = await rpcCaller.user.getList();

	const usersWithExpired = users.map((user) => ({
		...user,
		passwordExpireAtDate: user.passwordExpireAt ? new Date(user.passwordExpireAt) : undefined
	}));

	const maintenanceService = container.resolve('maintenanceService');
	const isDefaultUserExists = await maintenanceService.isDefaultUserExistsWithoutModification();

	return {
		users: usersWithExpired,
		isDefaultUserExists
	};
};

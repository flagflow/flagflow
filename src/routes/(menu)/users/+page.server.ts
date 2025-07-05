import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { apiCaller } }) => {
	const users = await apiCaller.user.getList();
	return {
		users
	};
};

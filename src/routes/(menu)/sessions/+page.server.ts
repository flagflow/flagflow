import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { apiCaller } }) => {
	const sessions = await apiCaller.session.getList();
	return {
		sessions
	};
};

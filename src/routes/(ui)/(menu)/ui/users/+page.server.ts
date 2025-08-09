import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const users = await rpcCaller.user.getList();
	return {
		users
	};
};

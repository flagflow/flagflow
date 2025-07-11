import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const flags = await rpcCaller.flag.getList();

	return {
		flags
	};
};

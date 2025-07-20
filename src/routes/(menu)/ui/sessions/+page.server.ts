import { getRelativeDateString } from '$lib/dateEx';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const sessions = await rpcCaller.session.getList();
	const sessionEx = sessions.map((session) => ({
		...session,
		createdAtElapsed: getRelativeDateString(session.createdAt)
	}));

	return {
		sessions: sessionEx
	};
};

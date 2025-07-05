import { getRelativeDateString } from '$lib/dateInterval';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { apiCaller } }) => {
	const sessions = await apiCaller.session.getList();
	const sessionEx = sessions.map((session) => ({
		...session,
		createdAtElapsed: getRelativeDateString(new Date(), session.createdAt)
	}));

	return {
		sessions: sessionEx
	};
};

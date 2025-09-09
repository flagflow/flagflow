import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { authentication } }) => {
	const sessionId = authentication.type === 'SESSION' ? authentication.sessionId : undefined;

	return {
		sessionId
	};
};

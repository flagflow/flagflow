import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { container } }) => {
	const flagService = container.resolve('flagService');

	const flagGroups = await flagService.getFlagGroups();

	return {
		flagGroups
	};
};

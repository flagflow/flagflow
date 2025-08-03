import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { container } }) => {
	const configService = container.resolve('configService');

	return {
		migration: configService.migration
	};
};

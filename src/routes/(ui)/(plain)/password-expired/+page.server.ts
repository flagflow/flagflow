import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { authentication } }) => {
	// Only allow access if user is authenticated but password is expired
	if (!authentication.success) throw redirect(302, '/login');

	// Password is not expired, redirect to main application
	if (authentication.type === 'SESSION' && !authentication.success.passwordExpired)
		throw redirect(302, '/');

	return {
		userName: authentication.success.userName
	};
};

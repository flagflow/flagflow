import { error } from '@sveltejs/kit';
import { formatDate } from 'date-fns';

import { createDownloadResponse } from '$lib/Response';

import type { RequestEvent, RequestHandler } from '../$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	// Service
	const configService = event.locals.container.resolve('configService');
	const flagService = event.locals.container.resolve('flagService');

	// Collect export data
	const tsFileContent = await flagService.getTSFileContent();
	if (!tsFileContent) return error(404, 'Failed to generate TypeScript types');

	// Prepare filename
	const filenameParts = [
		'flagflow',
		configService.environment,
		formatDate(new Date(), 'yyyyMMdd_HHmmss')
	];
	const filename = filenameParts.filter(Boolean).join('_') + '.json';

	// Response
	return createDownloadResponse(tsFileContent, filename);
};

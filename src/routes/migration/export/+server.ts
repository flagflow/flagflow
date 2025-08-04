import { error } from '@sveltejs/kit';
import { formatDate } from 'date-fns';

import { createDownloadResponse } from '$lib/Response';

import type { RequestEvent, RequestHandler } from '../$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	// Service
	const configService = event.locals.container.resolve('configService');
	const flagService = event.locals.container.resolve('flagService');

	// Collect export data
	const migrationData = await flagService.getMigrationFileContent();
	if (!migrationData) return error(404, 'Failed to generate migration data');

	// Prepare filename
	const filenameParts = [
		'flagflow',
		'migration',
		configService.environment,
		formatDate(new Date(), 'yyyyMMdd-HHmmss')
	];
	const filename = filenameParts.filter(Boolean).join('_') + '.json';

	// Response
	return createDownloadResponse(migrationData, filename, { prettyJson: true });
};

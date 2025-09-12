import { error } from '@sveltejs/kit';

import { createDownloadResponse, createMigrationFilename } from '$lib/Response';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// Service
	const configService = locals.container.resolve('configService');
	const flagService = locals.container.resolve('flagService');

	// Collect export data
	const migrationData = await flagService.getMigrationFileContent();
	if (!migrationData) return error(404, 'Failed to generate migration data');

	// Prepare filename
	const filename = createMigrationFilename(configService.environment);

	// Response
	return createDownloadResponse(migrationData, filename, { prettyJson: true });
};

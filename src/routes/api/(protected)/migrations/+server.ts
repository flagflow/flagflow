import { error } from '@sveltejs/kit';

import { createDownloadResponse, createJsonResponse, createMigrationFilename } from '$lib/Response';
import { zodFlattenError } from '$lib/zodEx';
import { MigrationFile } from '$types/Migration';

import type { RequestHandler } from './$types';

const schemaPUT = MigrationFile;

export const GET: RequestHandler = async ({ locals }) => {
	const configService = locals.container.resolve('configService');
	const flagService = locals.container.resolve('flagService');

	const migrationData = await flagService.getMigrationFileContent();

	const filename = createMigrationFilename(configService.environment);

	return createDownloadResponse(migrationData, filename, { prettyJson: true });
};

export const PUT: RequestHandler = async ({ locals, request }) => {
	const migrationData = schemaPUT.safeParse(await request.json());
	if (!migrationData.success)
		return error(400, `Invalid migration file: ${zodFlattenError(migrationData.error.issues)}`);

	const flagService = locals.container.resolve('flagService');
	const summary = await flagService.prepareMigration(migrationData.data);
	await flagService.executeMigration(summary.steps);

	return createJsonResponse({
		success: true,
		stepsExecuted: summary.steps.length
	});
};

export const PATCH: RequestHandler = async ({ locals }) => {
	const configService = locals.container.resolve('configService');
	if (!configService.migration.sourceUrl) return error(400, 'Missing migration remote URL');

	const httpClient = locals.container.resolve('httpClientService').createClient();
	const response = await httpClient.get(configService.migration.sourceUrl);
	const migrationData = MigrationFile.safeParse(response.data);
	if (!migrationData.success) return error(400, 'Invalid remote migration file');

	if (configService.environment === migrationData.data.environment)
		return error(400, `Cannot migrate to the same environment "${migrationData.data.environment}"`);

	const flagService = locals.container.resolve('flagService');
	const summary = await flagService.prepareMigration(migrationData.data);
	await flagService.executeMigration(summary.steps);

	return createJsonResponse({
		success: true,
		stepsExecuted: summary.steps.length
	});
};

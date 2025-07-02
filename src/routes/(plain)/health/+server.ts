import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (/*event: RequestEvent*/) => {
	//const etcdService = event.locals.container.resolve('etcdService');

	// const {
	// 	rows: [{ version }]
	// } = await database.execute<{ version: string }>('SELECT version()');
	// const memcacheVersion = await memcacheService.version();

	return new Response(
		JSON.stringify({
			keycloak: 'OK'
		}),
		{ status: 200 }
	);
};

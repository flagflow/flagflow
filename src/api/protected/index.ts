import { createApiRouter } from '$lib/api/init';

//import { keycloakApi } from './keycloak';

export const rootProtectedApi = createApiRouter({
	//keycloak: keycloakApi
});

if (process.env?.['NODE_ENV'] !== 'production')
	(await import('@dotenvx/dotenvx')).config({ ignore: ['MISSING_ENV_FILE'] });

import envVar from 'env-var';

export const config = {
	logLevel: envVar.get('LOGLEVEL').default('info').asString(),
	environment: envVar.get('ENVIRONMENT').default('').asString(),
	migration: {
		sourceEnvironment: envVar.get('MIGRATION_SOURCE_ENVIRONMENT').default('').asString(),
		sourceUrl: envVar.get('MIGRATION_SOURCE_URL').default('').asString()
	},
	etcd: {
		server: envVar.get('ETCD_SERVER').default('localhost:2379').asString(),
		username: envVar.get('ETCD_USERNAME').asString(),
		password: envVar.get('ETCD_PASSWORD').asString(),
		namespace: envVar.get('ETCD_NAMESPACE').default('default').asString()
	},
	keycloak: {
		host: envVar.get('KEYCLOAK_HOST').asString(),
		realm: envVar.get('KEYCLOAK_REALM').default('master').asString(),
		client: envVar.get('KEYCLOAK_CLIENT').default('flagflow-frontend').asString()
	},
	session: {
		enabled: envVar.get('SESSION_USERS_ENABLED').default('true').asBool(),
		defaultUser: {
			username: envVar.get('SESSION_DEFAULT_USERNAME').asString(),
			password: envVar.get('SESSION_DEFAULT_PASSWORD').asString()
		},
		timeoutSecs: envVar
			.get('SESSION_TIMEOUT_SEC')
			.default(30 * 60)
			.asIntPositive()
	},
	metrics: {
		enabled: envVar.get('METRICS_ENABLED').asBool() || false
	},
	dev: {
		rpcSlowdownMs: envVar.get('DEV_RPC_SLOWDOWN_MS').asIntPositive()
	}
};

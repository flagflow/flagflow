const isProduction = process.env?.['NODE_ENV'] === 'production';

if (!isProduction) (await import('@dotenvx/dotenvx')).config({ ignore: ['MISSING_ENV_FILE'] });

import envVar from 'env-var';

export const config = {
	logLevel: envVar.get('LOGLEVEL').default('info').asString(),

	environment: envVar.get('ENVIRONMENT').default('').asString(),

	fsPersistentRoot: isProduction ? '/data' : './data',

	// Remote migration settings
	migration: {
		sourceEnvironment: envVar.get('MIGRATION_SOURCE_ENVIRONMENT').default('').asString(),
		sourceUrl: envVar.get('MIGRATION_SOURCE_URL').default('').asString()
	},

	etcd: {
		server: envVar.get('ETCD_SERVER').default('').asString(),
		username: envVar.get('ETCD_USERNAME').asString(),
		password: envVar.get('ETCD_PASSWORD').asString(),
		namespace: envVar.get('ETCD_NAMESPACE').default('default').asString()
	},

	// If you are using Keycloak for authentication
	keycloak: {
		host: envVar.get('KEYCLOAK_HOST').asString(),
		realm: envVar.get('KEYCLOAK_REALM').default('master').asString(),
		client: envVar.get('KEYCLOAK_CLIENT').default('flagflow-frontend').asString()
	},

	// Settings of in-built user session
	session: {
		// Enable user sessions
		enabled: envVar.get('SESSION_USERS_ENABLED').default('true').asBool(),
		// Default user (creation at startup) credentials
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

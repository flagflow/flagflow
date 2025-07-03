import { config as dotenvInit } from '@dotenvx/dotenvx';
dotenvInit();
import envVar from 'env-var';

const defaults = {
	LogLevel: 'info',
	MetricsEnabled: false
};

export const config = {
	logLevel: envVar.get('LOGLEVEL').asString() || defaults.LogLevel,
	etcd: {
		server: envVar.get('ETCD_SERVER').required().asString(),
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
		enabled: envVar.get('SESSION_ENABLED').default('true').asBool(),
		timeoutSecs: envVar
			.get('SESSION_TIMEOUT_SEC')
			.default(1 * 60)
			.asIntPositive()
	},
	metrics: {
		enabled: envVar.get('METRICS_ENABLED').asBool() || defaults.MetricsEnabled
	},
	dev: {
		apiSlowdownMs: envVar.get('DEV_API_SLOWDOWN_MS').asIntPositive()
	}
};

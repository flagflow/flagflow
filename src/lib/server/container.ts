/* eslint-disable unicorn/no-useless-undefined */
import { asFunction, asValue, type AwilixContainer, createContainer } from 'awilix';

import { generateTraceId } from '$lib/genId';

import { doneEtcdClient } from './persistent/etcdEngine';
import { doneFsClient } from './persistent/fsEngine';
import { FlagService, PersistentService, SessionService, UserService } from './services';
import { ConfigService, GlobalLogService, HttpClientService, LogService } from './services';
import { MaintenanceService } from './services/coreServices/MaintenanceService';

export { asClass, asFunction, asValue } from 'awilix';

type _Container = {
	traceId: string;
	userName: string | undefined;

	configService: ConfigService;
	globalLogService: GlobalLogService;
	logService: LogService;
	persistentService: PersistentService;
	httpClientService: HttpClientService;

	maintenanceService: MaintenanceService;
	sessionService: SessionService;
	userService: UserService;

	flagService: FlagService;
};

export const container = createContainer<_Container>({ strict: true }).register({
	configService: asFunction(ConfigService).singleton(),

	globalLogService: asFunction(GlobalLogService).scoped(),
	logService: asFunction(LogService).scoped(),
	persistentService: asFunction(PersistentService).scoped(),
	httpClientService: asFunction(HttpClientService).scoped(),

	maintenanceService: asFunction(MaintenanceService).scoped(),
	sessionService: asFunction(SessionService).scoped(),
	userService: asFunction(UserService).scoped(),
	flagService: asFunction(FlagService).scoped()
});
export type Container = AwilixContainer<_Container>;

const createMaintenanceService = () => {
	const scope = container.createScope();
	scope.register({
		traceId: asValue(generateTraceId()),
		userName: asValue(undefined)
	});

	return scope.resolve('maintenanceService');
};

// Maintenance service runs every 113 seconds
const maintenanceTimer = setInterval(
	async () => await createMaintenanceService().deleteExpiredSessions(),
	113 * 1000
);

// Create default user if needed
await createMaintenanceService().createDefaultUser();

// Done function to clean up the container
export const doneContainer = async () => {
	await container.dispose();
	clearInterval(maintenanceTimer);
	await doneEtcdClient();
	await doneFsClient();
};

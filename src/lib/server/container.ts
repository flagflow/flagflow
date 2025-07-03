/* eslint-disable unicorn/no-useless-undefined */
import { asFunction, asValue, type AwilixContainer, createContainer } from 'awilix';

import { generateTraceId } from '$lib/genId';

import { doneEtcdClient } from './etcd';
import { EtcdService, SessionService, UserService } from './services';
import { ConfigService, GlobalLogService, HttpClientService, LogService } from './services';
import { MaintenanceService } from './services/coreServices/MaintenanceService';

export { asClass, asFunction, asValue } from 'awilix';

type _Container = {
	traceId: string;
	userName: string | undefined;

	configService: ConfigService;
	globalLogService: GlobalLogService;
	logService: LogService;
	etcdService: EtcdService;
	httpClientService: HttpClientService;

	maintenanceService: MaintenanceService;
	sessionService: SessionService;
	userService: UserService;
};

export const container = createContainer<_Container>({ strict: true }).register({
	configService: asFunction(ConfigService).singleton(),
	globalLogService: asFunction(GlobalLogService).scoped(),
	logService: asFunction(LogService).scoped(),
	etcdService: asFunction(EtcdService).scoped(),
	httpClientService: asFunction(HttpClientService).scoped(),

	maintenanceService: asFunction(MaintenanceService).scoped(),
	sessionService: asFunction(SessionService).scoped(),
	userService: asFunction(UserService).scoped()
});
export type Container = AwilixContainer<_Container>;

// Maintenance service runs every 60 seconds
const maintenanceTimer = setInterval(async () => {
	const scope = container.createScope();
	scope.register({
		traceId: asValue(generateTraceId()),
		userName: asValue(undefined)
	});

	const maintenanceService = scope.resolve('maintenanceService');
	await maintenanceService.deleteExpiredSessions();
}, 10 * 1000);

// Done function to clean up the container
export const doneContainer = async () => {
	await container.dispose();
	clearInterval(maintenanceTimer);
	doneEtcdClient();
};

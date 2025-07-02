import { asFunction, type AwilixContainer, createContainer } from 'awilix';

import { doneEtcdClient } from './etcd';
import { EtcdService, SessionService, UserService } from './services';
import { ConfigService, GlobalLogService, HttpClientService, LogService } from './services';

export { asClass, asFunction, asValue } from 'awilix';

type _Container = {
	traceId: string;
	userName: string | undefined;

	configService: ConfigService;
	globalLogService: GlobalLogService;
	logService: LogService;
	etcdService: EtcdService;
	httpClientService: HttpClientService;

	sessionService: SessionService;
	userService: UserService;
};

export const container = createContainer<_Container>({ strict: true }).register({
	configService: asFunction(ConfigService).singleton(),
	globalLogService: asFunction(GlobalLogService).scoped(),
	logService: asFunction(LogService).scoped(),
	etcdService: asFunction(EtcdService).scoped(),
	httpClientService: asFunction(HttpClientService).scoped(),

	sessionService: asFunction(SessionService).scoped(),
	userService: asFunction(UserService).scoped()
});
export type Container = AwilixContainer<_Container>;

export const doneContainer = async () => {
	await container.dispose();
	doneEtcdClient();
};

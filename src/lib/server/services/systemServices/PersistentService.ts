import { getEtcd } from '$lib/server/etcd';

import type { ConfigService, LogService } from '../index';

type PersistentServiceParameters = {
	configService: ConfigService;
	logService: LogService;
};

export const PersistentService = ({ configService, logService }: PersistentServiceParameters) =>
	getEtcd(configService.etcd, logService('etcd'));
export type PersistentService = ReturnType<typeof PersistentService>;

import { getEtcd } from '$lib/server/etcd';

import type { ConfigService, LogService } from '../index';

type EtcdServiceParameters = {
	configService: ConfigService;
	logService: LogService;
};

export const EtcdService = ({ configService, logService }: EtcdServiceParameters) =>
	getEtcd(configService.etcd, logService('etcd'));
export type EtcdService = ReturnType<typeof EtcdService>;

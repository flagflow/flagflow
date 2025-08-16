import { getPersistenceInstance } from '$lib/server/persistent/instance';

import type { ConfigService, LogService } from '../index';

type PersistentServiceParameters = {
	configService: ConfigService;
	logService: LogService;
};

export const PersistentService = ({ configService, logService }: PersistentServiceParameters) =>
	getPersistenceInstance(configService, logService);
export type PersistentService = ReturnType<typeof PersistentService>;

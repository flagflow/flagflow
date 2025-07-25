import type { EtcdService, LogService } from '../index';

type MaintenanceServiceParameters = {
	etcdService: EtcdService;
	logService: LogService;
};

export const MaintenanceService = ({ etcdService, logService }: MaintenanceServiceParameters) => {
	const log = logService('maintenance');

	return {
		deleteExpiredSessions: async () => {
			const { list, undefs } = await etcdService.list('session', 0, 'Key');

			let deleted = 0;
			for (const [sessionId, session] of Object.entries(list))
				if (!session || ('expiredAt' in session && session.expiredAt < Date.now())) {
					await etcdService.delete('session', sessionId);
					deleted++;
				}
			for (const undef of undefs) {
				await etcdService.delete('session', undef);
				deleted++;
			}

			if (deleted > 0) log.info({ deleted }, 'Deleted expired sessions');
			else log.debug({ deleted }, 'Deleted expired sessions');
		}
	};
};
export type MaintenanceService = ReturnType<typeof MaintenanceService>;

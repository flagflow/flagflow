import { UserPermissionAll } from '$types/UserPermissions';

import type { ConfigService, EtcdService, LogService } from '../index';
import { hashPassword } from './UserService';

type MaintenanceServiceParameters = {
	logService: LogService;
	configService: ConfigService;
	etcdService: EtcdService;
};

export const MaintenanceService = ({
	etcdService,
	logService,
	configService
}: MaintenanceServiceParameters) => {
	const log = logService('maintenance');

	return {
		createDefaultUser: async () => {
			const { username, password } = configService.session.defaultUser;
			if (username && password) {
				const user = await etcdService.get('user', username);
				if (!user)
					await etcdService.put('user', username, {
						name: username,
						enabled: true,
						passwordHash: hashPassword(password),
						passwordExpireAt: undefined,
						permissions: UserPermissionAll
					});
			}
		},
		isDefaultUserExistsWithoutModification: async (): Promise<boolean> => {
			const { username, password } = configService.session.defaultUser;
			if (!username || !password) return false;

			const user = await etcdService.get('user', username);
			if (!user) return false;

			if (user.passwordHash !== hashPassword(password)) return false;

			return true;
		},
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

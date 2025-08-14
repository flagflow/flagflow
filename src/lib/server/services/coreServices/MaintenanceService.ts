import { UserPermissionAll } from '$types/UserPermissions';

import type { ConfigService, LogService, PersistentService } from '../index';
import { hashPassword } from './UserService';

type MaintenanceServiceParameters = {
	logService: LogService;
	configService: ConfigService;
	persistentService: PersistentService;
};

export const MaintenanceService = ({
	persistentService,
	logService,
	configService
}: MaintenanceServiceParameters) => {
	const log = logService('maintenance');

	return {
		createDefaultUser: async () => {
			const { username, password } = configService.session.defaultUser;
			if (username && password) {
				const user = await persistentService.get('user', username);
				if (!user)
					await persistentService.put('user', username, {
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

			const user = await persistentService.get('user', username);
			if (!user) return false;

			if (user.passwordHash !== hashPassword(password)) return false;

			return true;
		},
		deleteExpiredSessions: async () => {
			const { list, undefs } = await persistentService.list('session', 0, 'Key');

			let deleted = 0;
			for (const [sessionId, session] of Object.entries(list))
				if (!session || ('expiredAt' in session && session.expiredAt < Date.now())) {
					await persistentService.delete('session', sessionId);
					deleted++;
				}
			for (const undef of undefs) {
				await persistentService.delete('session', undef);
				deleted++;
			}

			if (deleted > 0) log.info({ deleted }, 'Deleted expired sessions');
			else log.debug({ deleted }, 'Deleted expired sessions');
		}
	};
};
export type MaintenanceService = ReturnType<typeof MaintenanceService>;

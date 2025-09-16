import { createHash } from 'node:crypto';

import type { LogService, PersistentService } from '../index';

type UserServiceParameters = {
	persistentService: PersistentService;
	logService: LogService;
};

export const hashPassword = (password: string) =>
	createHash('sha1').update(password).digest('hex').toLowerCase();

export const UserService = ({ persistentService, logService }: UserServiceParameters) => {
	const log = logService('user');

	return {
		hashPassword,
		authUser: async (username: string, password: string) => {
			const passwordHash = hashPassword(password);

			let user = await persistentService.get('user', username);

			if (!user) log.error({ username }, 'User not found');
			if (!user?.enabled) {
				log.error({ username }, 'User disabled');
				user = undefined;
			}
			if (user?.passwordHash != passwordHash) {
				log.error({ username }, 'Invalid password');
				user = undefined;
			}

			if (!user) throw new Error('Login error');

			return {
				username,
				name: user.name,
				permissions: user.permissions,
				passwordExpireAt: user.passwordExpireAt
			};
		}
	};
};
export type UserService = ReturnType<typeof UserService>;

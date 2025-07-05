import { createHash } from 'node:crypto';

import type { EtcdService, LogService } from '../index';

type UserServiceParameters = {
	etcdService: EtcdService;
	logService: LogService;
};

export const hashPassword = (password: string) =>
	createHash('sha1').update(password).digest('hex').toLowerCase();

export const UserService = ({ etcdService, logService }: UserServiceParameters) => {
	const log = logService('user');

	return {
		hashPassword,
		authUser: async (username: string, password: string) => {
			const passwordHash = hashPassword(password);

			let user = await etcdService.get('user', username);
			if (user?.passwordHash != passwordHash) user = undefined;
			if (!user) {
				log.error({ username }, 'Login error');
				throw new Error('Login error');
			}

			return {
				username,
				name: user.name,
				roles: user.roles
			};
		}
		// changePassword: async (email: string, currentPassword: string, nextPassword: string) => {
		// 	const currentPasswordHash = hashPassword(currentPassword);
		// 	const nextPasswordHash = hashPassword(nextPassword);
		// 	const updateResult = await database
		// 		.update(schema.user)
		// 		.set({
		// 			passwordHash: nextPasswordHash,
		// 			passwordExpirationAt: await getPasswordExpiration()
		// 		})
		// 		.where(
		// 			and(eq(schema.user.email, email), eq(schema.user.passwordHash, currentPasswordHash))
		// 		);

		// 	if (updateResult.rowCount !== 1) {
		// 		log.error({ email }, 'Password change failed');
		// 		throw new Error('Password change failed');
		// 	}
		// },
		// updateSettings: async (email: string, settings: UserSettings) => {
		// 	const updateResult = await database
		// 		.update(schema.user)
		// 		.set({ settings: JSON.stringify(settings) })
		// 		.where(and(eq(schema.user.email, email)));

		// 	if (updateResult.rowCount !== 1) {
		// 		log.error({ email }, 'UsetSettings change failed');
		// 		throw new Error('UsetSettings change failed');
		// 	}
		// },
		// addUser: async (name: string, email: string, password: string) => {
		// 	if (await database.query.user.findFirst({ where: and(eq(schema.user.email, email)) })) {
		// 		log.error({ email }, 'Email already exists');
		// 		throw new Error('Email already exists');
		// 	}
		// 	const [{ id }] = await database
		// 		.insert(schema.user)
		// 		.values({
		// 			name,
		// 			email,
		// 			passwordHash: hashPassword(password),
		// 			passwordExpirationAt: await getPasswordExpiration(),
		// 			settings: '{}'
		// 		})
		// 		.returning({ id: schema.user.id });
		// 	return id;
		// },
		// removeUserById: async (id: number) =>
		// 	database.delete(schema.user).where(eq(schema.user.id, id)),
		// removeUserByEmail: async (email: string) =>
		// 	database.delete(schema.user).where(eq(schema.user.email, email)),
		// getAllUsers: async () =>
		// 	database.query.user.findMany({
		// 		columns: {
		// 			id: true,
		// 			name: true,
		// 			email: true
		// 		},
		// 		orderBy: schema.user.name
		// 	})
	};
};
export type UserService = ReturnType<typeof UserService>;

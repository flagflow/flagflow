import pDebounce from 'p-debounce';

import { generateSessionId } from '$lib/genId';
import type { UserSession } from '$types/UserSession';

import type { ConfigService, LogService, PersistentService } from '../index';

type SessionServiceParameters = {
	configService: ConfigService;
	persistentService: PersistentService;
	logService: LogService;
};

export const SessionService = ({
	configService,
	persistentService,
	logService
}: SessionServiceParameters) => {
	const log = logService('session');

	const debounceTouchSession = pDebounce(
		async (sessionId: string) => {
			try {
				await persistentService.touch('session', sessionId);
				log.debug({ sessionId }, 'Touch');
			} catch {
				log.warn({ sessionId }, 'Touch unknown');
			}
		},
		5000,
		{ before: true }
	);

	const getSession = async (sessionId: string): Promise<UserSession | undefined> => {
		const session = await persistentService.get('session', sessionId);
		if (!session) {
			log.warn(`Not found ${sessionId}`);
			return;
		}
		log.debug({ sessionId }, 'Get');

		await debounceTouchSession(sessionId);

		return session;
	};

	return {
		getSession,
		createSession: async (partialSession: Omit<UserSession, 'expiredAt' | 'ttlSeconds'>) => {
			const sessionId = generateSessionId();
			const session: UserSession = {
				...partialSession,
				expiredAt: Date.now() + configService.session.timeoutSecs * 1000,
				ttlSeconds: configService.session.timeoutSecs
			};

			await persistentService.put('session', sessionId, session);

			log.debug({ sessionId }, 'Set');
			return sessionId;
		},
		deleteSession: async (sessionId: string) => {
			try {
				await persistentService.delete('session', sessionId);
				log.debug({ sessionId }, 'Delete');
			} catch {
				log.warn({ sessionId }, 'Delete unknown');
			}
		},
		touchSession: async (sessionId: string) => await debounceTouchSession(sessionId)
	};
};
export type SessionService = ReturnType<typeof SessionService>;

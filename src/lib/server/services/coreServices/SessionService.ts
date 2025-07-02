import pDebounce from 'p-debounce';

import { generateSessionId } from '$lib/genId';
import type { UserSession } from '$types/UserSession';

import type { EtcdService, LogService } from '../index';

type SessionServiceParameters = {
	etcdService: EtcdService;
	logService: LogService;
};

export const SessionService = ({ etcdService, logService }: SessionServiceParameters) => {
	const log = logService('session');

	const debounceTouchSession = pDebounce(
		async (sessionId: string) => {
			try {
				await etcdService.touch('session', sessionId);
				log.debug('Touch');
			} catch {
				log.warn(`Touch unknown ${sessionId}`);
			}
		},
		5000,
		{ before: true }
	);

	const getSession = async (sessionId: string): Promise<UserSession | undefined> => {
		const session = await etcdService.get('session', sessionId);
		if (!session) {
			log.warn(`Not found ${sessionId}`);
			return;
		}
		log.debug({ sessionId: sessionId }, 'Get');
		return session;
	};

	return {
		getSession,
		createSession: async (session: UserSession) => {
			const sessionId = generateSessionId();

			await etcdService.put('session', sessionId, session, 60);

			log.debug({ sessionId: sessionId }, 'Set');
			return sessionId;
		},
		deleteSession: async (sessionId: string) => {
			try {
				await etcdService.delete('session', sessionId);
				log.debug('Delete');
			} catch {
				log.warn(`Delete unknown ${sessionId}`);
			}
		},
		touchSession: async (sessionId: string) => await debounceTouchSession(sessionId)
	};
};
export type SessionService = ReturnType<typeof SessionService>;

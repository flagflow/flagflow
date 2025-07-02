import pino from 'pino';

import { config } from './config';

export type ChildLogger = pino.Logger<never, boolean>;

const baseLogger = pino({
	level: config.logLevel || 'info',
	formatters: {
		bindings: (bindings) => {
			return {
				pid: bindings['pid'],
				host: bindings['hostname']
			};
		}
	}
});

export const createLogger = (module: string, bindings: object = {}) =>
	baseLogger.child({ name: module, ...bindings });

createLogger('application').info({ level: config.logLevel, logLevel: config.logLevel }, 'Started');

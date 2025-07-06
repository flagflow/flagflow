import pino from 'pino';

import { config } from './config';

export type ChildLogger = pino.Logger<'audit', boolean>;

const baseLogger = pino({
	level: config.logLevel || 'info',
	customLevels: {
		audit: 100
	},
	useOnlyCustomLevels: false,
	formatters: {
		bindings: (bindings) => ({
			pid: bindings['pid'],
			host: bindings['hostname']
		}),
		level: (label, level) => ({ level, label })
	}
});

export const createLogger = (module: string, bindings: object = {}) =>
	baseLogger.child({ name: module, ...bindings });

createLogger('application').info({ level: config.logLevel, logLevel: config.logLevel }, 'Started');

import { createLogger } from '../../log';

type LogServiceParameters = {
	traceId: string;
	userName: string | undefined;
};

export const LogService =
	({ traceId, userName }: LogServiceParameters) =>
	(module: string) =>
		createLogger(module, { traceId, userName });
export type LogService = ReturnType<typeof LogService>;

// eslint-disable-next-line unicorn/consistent-function-scoping
export const GlobalLogService = () => (module: string) => createLogger(module);
export type GlobalLogService = ReturnType<typeof GlobalLogService>;

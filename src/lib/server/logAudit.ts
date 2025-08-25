import type { PartialDeep } from 'type-fest';

import type { AuthenticationType } from '$types/Auth';

import type { ChildLogger } from './log';
import type { ConfigService } from './services';

export type LogAuditObject = PartialDeep<{
	subject: string;
	auth: {
		method: AuthenticationType;
		user: {
			username: string;
			permissions: string[];
		};
	};
	request: {
		data: unknown;
		size: number;
	};
	response: {
		data: unknown;
		size: number;
		errorMessage: string;
	};
	performance: {
		duration: number;
	};
}>;

export const logAudit = (
	config: ConfigService,
	logger: ChildLogger,
	auditObject: LogAuditObject
) => {
	if (!config.auditLog.enabled) return;

	if (auditObject.request?.data)
		auditObject.request.size = JSON.stringify(auditObject.request.data).length;
	if (auditObject.response?.data)
		auditObject.response.size = JSON.stringify(auditObject.response.data).length;

	logger.audit({ audit: auditObject }, auditObject.subject);
};

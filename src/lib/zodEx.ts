import type { ZodIssue } from 'zod';

export const zodFlattenError = (errors: ZodIssue[]): string =>
	errors.map(({ path, message }) => `Field ${path.join('.')} ${message.toLowerCase()}`).join(', ');

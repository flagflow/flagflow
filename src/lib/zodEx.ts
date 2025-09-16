import type { z } from 'zod';

export const zodFlattenError = (errors: z.core.$ZodIssue[]): string =>
	errors.map(({ path, message }) => `Field ${path.join('.')} ${message.toLowerCase()}`).join(', ');

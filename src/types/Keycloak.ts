import { z } from 'zod';

import { KeycloakJwtString } from './jwt';

export const KeycloakTokenResponse = z.object({
	token_type: z.literal('Bearer'),

	access_token: KeycloakJwtString,
	expires_in: z.number(),
	'not-before-policy': z.number(),

	refresh_token: KeycloakJwtString,
	refresh_expires_in: z.number(),

	id_token: KeycloakJwtString.optional()
});
export type KeycloakTokenResponse = z.infer<typeof KeycloakTokenResponse>;

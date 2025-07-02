import { z } from 'zod';

export const KeycloakJwtString = z.string().jwt();
export type KeycloakJwtString = z.infer<typeof KeycloakJwtString>;

export type JwtTokens = {
	access_token: string;
	refresh_token: string | undefined;
	id_token: string | undefined;
};

export const JwtAccessToken = z.object({
	typ: z.literal('Bearer'),
	exp: z.number(),
	iat: z.number(),
	iss: z.string().url(),
	realm_access: z.object({
		roles: z.array(z.string())
	}),
	resource_access: z.record(
		z.string(),
		z.object({
			roles: z.array(z.string())
		})
	),
	name: z.string(),
	email: z.string().email()
});
export type JwtAccessToken = z.infer<typeof JwtAccessToken>;

export const JwtRefreshToken = z.object({
	typ: z.literal('Refresh'),
	exp: z.number(),
	iat: z.number(),
	iss: z.string().url()
});
export type JwtRefreshToken = z.infer<typeof JwtRefreshToken>;

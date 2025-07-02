import { z } from 'zod';

export const KeycloakJwtString = z.string().jwt();
export type KeycloakJwtString = z.infer<typeof KeycloakJwtString>;

export const JwtAuthenticationInfo = z.object({
	name: z.string(),
	email: z.string().email(),
	roles: z.array(z.string()),
	expiredAt: z.date()
});
export type JwtAuthenticationInfo = z.infer<typeof JwtAuthenticationInfo>;

export const JwtTokens = z.object({
	authentication: JwtAuthenticationInfo.optional(),
	access_token: KeycloakJwtString.optional(),
	refresh_token: KeycloakJwtString.optional(),
	id_token: KeycloakJwtString.optional()
});
export type JwtTokens = z.infer<typeof JwtTokens>;

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

import jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

import { combineUrls } from '$lib/urlEx';
import { JwtAccessToken, type KeycloakJwtString } from '$types/Jwt';
import { KeycloakTokenResponse } from '$types/Keycloak';

import { config } from './config';

const postAcceptLoginPath = '/auth/keycloak/callback';
const postLogoutPath = '/login';
const keycloakIssuer = config.keycloak.host
	? combineUrls(config.keycloak.host, 'realms', config.keycloak.realm)
	: '';
const keycloakProtocolUrl = config.keycloak.host
	? combineUrls(keycloakIssuer, 'protocol/openid-connect')
	: '';

const generateKeycloakLoginUrl = (callbackHost: string) => {
	const keycloakLoginUrl = config.keycloak.host
		? new URL(combineUrls(keycloakProtocolUrl, 'auth'))
		: undefined;

	if (keycloakLoginUrl) {
		keycloakLoginUrl.searchParams.append('client_id', config.keycloak.client);
		keycloakLoginUrl.searchParams.append(
			'redirect_uri',
			combineUrls(callbackHost, postAcceptLoginPath)
		);
		keycloakLoginUrl.searchParams.append('response_type', 'code');
		keycloakLoginUrl.searchParams.append('scope', 'openid profile email');
	}
	return keycloakLoginUrl?.toString();
};

const generateKeycloakLogoutUrl = (callbackHost: string, id_token: string | undefined) => {
	const keycloakLoginUrl = new URL(combineUrls(keycloakProtocolUrl, 'logout'));

	keycloakLoginUrl.searchParams.append('client_id', config.keycloak.client);
	if (id_token) keycloakLoginUrl.searchParams.append('id_token_hint', encodeURIComponent(id_token));
	keycloakLoginUrl.searchParams.append(
		'post_logout_redirect_uri',
		combineUrls(callbackHost, postLogoutPath)
	);

	return keycloakLoginUrl.toString();
};

export const keycloakUrls = {
	enabled: !!config.keycloak.host,

	issuerUrl: keycloakIssuer,
	loginUrl: generateKeycloakLoginUrl,
	logoutUrl: generateKeycloakLogoutUrl,
	certsUrl: combineUrls(keycloakProtocolUrl, '/certs'),
	tokenUrl: combineUrls(keycloakProtocolUrl, '/token')
};

export const accessKeycloakTokens = async (
	callbackHost: string,
	code: string
): Promise<KeycloakTokenResponse> => {
	try {
		const tokenEndpoint = keycloakUrls.tokenUrl;
		const redirectUri = combineUrls(callbackHost, postAcceptLoginPath);

		const formData = new URLSearchParams();
		formData.append('grant_type', 'authorization_code');
		formData.append('client_id', config.keycloak.client);
		formData.append('redirect_uri', redirectUri);
		formData.append('code', code);

		const response = await fetch(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData.toString()
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Keycloak error ${errorData.error_description || response.statusText}`);
		}

		return KeycloakTokenResponse.parse(await response.json());
	} catch (error) {
		throw new Error(`Failed to exchange code: ${error}`);
	}
};

export const refreshKeycloakTokens = async (
	refresh_token: string
): Promise<KeycloakTokenResponse> => {
	try {
		const tokenEndpoint = keycloakUrls.tokenUrl;

		const formData = new URLSearchParams();
		formData.append('grant_type', 'refresh_token');
		formData.append('client_id', config.keycloak.client);
		formData.append('refresh_token', refresh_token);

		const response = await fetch(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData.toString()
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Keycloak error ${errorData.error_description || response.statusText}`);
		}

		return KeycloakTokenResponse.parse(await response.json());
	} catch (error) {
		throw new Error(`Failed to exchange code: ${error}`);
	}
};

const jwksClient = new JwksClient({
	jwksUri: combineUrls(keycloakProtocolUrl, '/certs'),
	cache: true,
	rateLimit: true,
	jwksRequestsPerMinute: 5
});

export const verifyKeycloakAccessToken = async (
	accessToken: KeycloakJwtString
): Promise<JwtAccessToken> => {
	const issuerUrl = keycloakUrls.issuerUrl;

	return new Promise((resolve, reject) => {
		const jwksGetKey = async (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
			try {
				const key = await jwksClient.getSigningKey(header.kid);
				// eslint-disable-next-line unicorn/no-null
				callback(null, key.getPublicKey());
			} catch (error) {
				reject(new Error(`Failed to get signing key: ${error}`));
				return;
			}
		};

		jwt.verify(accessToken, jwksGetKey, { issuer: issuerUrl }, (error, decoded) => {
			if (error) reject(new Error(`Access token verification failed: ${error.message}`));
			else if (typeof decoded === 'object')
				resolve(JwtAccessToken.parse(decoded as JwtAccessToken));
		});
	});
};

export const verifyKeycloakCommunication = async () => jwksClient.getKeys();

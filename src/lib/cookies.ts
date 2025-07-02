import { serialize as serializeCookie, type SerializeOptions } from 'cookie';

// import dayjs from 'dayjs';
import { dateAddSeconds } from '$lib/dateEx';

export const JWT_COOKIE_NAMES = {
	accessToken: 'access_token',
	refreshToken: 'refresh_token',
	idToken: 'id_token'
};
export const SESSION_COOKIE_NAME = 'session';

type TokenInput = {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	refresh_expires_in: number;
	id_token?: string | undefined;
};
export const setTokensCookies = (tokens: TokenInput) => {
	deleteSessionCookie();

	const now = new Date();
	const defaultOptions: SerializeOptions = {
		path: '/',
		secure: true,
		sameSite: 'lax'
	};
	document.cookie = serializeCookie(JWT_COOKIE_NAMES.accessToken, tokens.access_token, {
		expires: dateAddSeconds(now, tokens.expires_in),
		...defaultOptions
	});
	document.cookie = serializeCookie(JWT_COOKIE_NAMES.refreshToken, tokens.refresh_token, {
		expires: dateAddSeconds(now, tokens.refresh_expires_in),
		...defaultOptions
	});
	if (tokens.id_token)
		document.cookie = serializeCookie(JWT_COOKIE_NAMES.idToken, tokens.id_token, {
			expires: dateAddSeconds(now, tokens.expires_in),
			...defaultOptions
		});

	// document.cookie = serializeCookie(
	// 	'token_last_refresh',
	// 	dayjs(now).format('YYYY-MM-DD_HH-mm-ss'),
	// 	{
	// 		expires: dateAddSeconds(now, 12 * 60 * 60),
	// 		...defaultOptions
	// 	}
	// );
};

export const deleteTokensCookies = () => {
	for (const cookieName of Object.values(JWT_COOKIE_NAMES))
		document.cookie = serializeCookie(cookieName, '', { expires: new Date(), path: '/' });
};

export const setSessionCookie = (sessionId: string, addDays = 0) => {
	deleteTokensCookies();
	const options: SerializeOptions = {
		path: '/',
		secure: true,
		sameSite: 'lax'
	};
	if (addDays > 0) {
		const expires = new Date();
		expires.setDate(expires.getDate() + addDays);
		options.expires = expires;
	}
	document.cookie = serializeCookie(SESSION_COOKIE_NAME, sessionId, options);
};

export const deleteSessionCookie = () => {
	document.cookie = serializeCookie(SESSION_COOKIE_NAME, '', { expires: new Date(), path: '/' });
};

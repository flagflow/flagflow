import type { Handle, RequestEvent } from '@sveltejs/kit';
import type { AnyTRPCRouter } from '@trpc/server';
import { resolveResponse } from '@trpc/server/http';
import { serialize, type SerializeOptions } from 'cookie';

import type { Context } from './context';

export const createTRPCHandle =
	<Router extends AnyTRPCRouter>(
		router: Router,
		url: string,
		createContext: (event: RequestEvent) => Promise<Context>
	): Handle =>
	async ({ event, resolve }) => {
		if (!event.url.pathname.startsWith(url + '/')) return resolve(event);

		const originalSetHeaders = event.setHeaders;
		const originalSetCookies = event.cookies.set;
		const originalDeleteCookies = event.cookies.delete;
		const headersProxy: Record<string, string> = {};
		const cookiesProxy: Record<string, { value: string; options: SerializeOptions }> = {};

		const defaultCookiesOptions: SerializeOptions = {
			httpOnly: true,
			sameSite: 'lax',
			secure: event.url.hostname === 'localhost' && event.url.protocol === 'http:' ? false : true
		};

		event.setHeaders = (headers) => {
			for (const [key, value] of Object.entries(headers)) headersProxy[key] = value;
			originalSetHeaders(headers);
		};
		event.cookies.set = (name, value, options) => {
			cookiesProxy[name] = { value, options: { ...defaultCookiesOptions, ...options } };
			originalSetCookies(name, value, options);
		};
		event.cookies.delete = (name, options) => {
			cookiesProxy[name] = { value: '', options: { ...options, maxAge: 0 } };
			originalDeleteCookies(name, options);
		};

		const httpResponse = await resolveResponse({
			router,
			req: event.request,
			path: event.url.pathname.slice(Math.max(0, url.length + 1)),
			createContext: async () => createContext?.(event),
			// eslint-disable-next-line unicorn/no-null
			error: null
		});

		const { status, headers, body } = httpResponse;

		const finalHeaders = new Headers();
		for (const [key, value] of Object.entries(headers)) finalHeaders.set(key, value);
		for (const [key, value] of Object.entries(headersProxy)) finalHeaders.set(key, value);
		for (const [name, { value, options }] of Object.entries(cookiesProxy)) {
			const serializedCookie = serialize(name, value, options);
			finalHeaders.append('Set-Cookie', serializedCookie);
		}

		return new Response(body, { status, headers: finalHeaders });
	};

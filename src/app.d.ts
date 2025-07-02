import type { ApiLocalCaller } from '$lib/api/init';
import type { Container } from '$lib/server/container';
import type { JwtTokens } from '$types/Wwt';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			apiCaller: ApiLocalCaller;
			container: Container;
			jwtTokens: JwtTokens;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

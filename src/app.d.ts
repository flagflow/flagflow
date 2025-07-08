import type { ApiLocalCaller } from '$lib/api/init';
import type { Container } from '$lib/server/container';
import type { Authentication } from '$types/auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			apiCaller: ApiLocalCaller;
			container: Container;
			authentication: Authentication;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

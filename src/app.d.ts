import type { RpcLocalCaller } from '$lib/rpc/init';
import type { Container } from '$lib/server/container';
import type { Authentication } from '$types/auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			rpcCaller: RpcLocalCaller;
			container: Container;
			authentication: Authentication;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

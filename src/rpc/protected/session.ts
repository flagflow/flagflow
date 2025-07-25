import { z } from 'zod';

import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import type { EtcdSession } from '$types/etcd';
import { etcdRecordToArray, EtcdSessionKey } from '$types/etcd';

export const sessionRpc = createRpcRouter({
	getList: rpcProcedure.meta({ permission: 'admin' }).query(async ({ ctx }) => {
		const etcdService = ctx.container.resolve('etcdService');
		const { list: sessionRecords } = await etcdService.list('session');
		const sessions = etcdRecordToArray<EtcdSession>(sessionRecords);

		return sessions;
	}),
	delete: rpcProcedure
		.meta({ permission: 'admin' })
		.input(
			z.object({
				sessionId: EtcdSessionKey
			})
		)
		.mutation(async ({ ctx, input }) => {
			const sessionService = ctx.container.resolve('sessionService');
			await sessionService.deleteSession(input.sessionId);
		})
});

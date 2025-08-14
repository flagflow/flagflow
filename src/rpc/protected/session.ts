import { z } from 'zod';

import { createRpcRouter, rpcProcedure } from '$lib/rpc/init';
import type { PersistentSession } from '$types/persistent';
import { persistentRecordToArray, PersistentSessionKey } from '$types/persistent';

const rpcProcedureUsersPermission = rpcProcedure.meta({ permission: 'users' });

export const sessionRpc = createRpcRouter({
	getList: rpcProcedureUsersPermission.query(async ({ ctx }) => {
		const persistentService = ctx.container.resolve('persistentService');
		const { list: sessionRecords } = await persistentService.list('session');
		const sessions = persistentRecordToArray<PersistentSession>(sessionRecords);

		return sessions;
	}),
	delete: rpcProcedureUsersPermission
		.input(
			z.object({
				sessionId: PersistentSessionKey
			})
		)
		.mutation(async ({ ctx, input }) => {
			const sessionService = ctx.container.resolve('sessionService');
			await sessionService.deleteSession(input.sessionId);
		})
});

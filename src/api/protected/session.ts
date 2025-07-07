import { z } from 'zod';

import { ZNonEmptryString } from '$api/zodTypes';
import { apiProcedure, createApiRouter } from '$lib/api/init';
import type { EtcdSession } from '$types/Etcd';
import { etcdRecordToArray } from '$types/Etcd';

export const sessionApi = createApiRouter({
	getList: apiProcedure.query(async ({ ctx }) => {
		const etcdService = ctx.container.resolve('etcdService');
		const sessionRecords = await etcdService.list('session');
		const sessions = etcdRecordToArray<EtcdSession>(sessionRecords);

		return sessions;
	}),
	delete: apiProcedure
		.input(
			z.object({
				sessionId: ZNonEmptryString()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const sessionService = ctx.container.resolve('sessionService');
			await sessionService.deleteSession(input.sessionId);
		})
});

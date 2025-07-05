import { z } from 'zod';

import { ZNonEmptryString } from '$api/zodTypes';
import { apiProcedure, createApiRouter } from '$lib/api/init';
import { etcdRecordToArray } from '$types/Etcd';

export const sessionApi = createApiRouter({
	getList: apiProcedure.query(async ({ ctx }) => {
		const sessionService = ctx.container.resolve('sessionService');
		const sessionsAsRecord = await sessionService.getAll();
		const sessions = etcdRecordToArray(sessionsAsRecord);

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

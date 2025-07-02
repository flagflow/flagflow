import { getAxiosInstance } from '$lib/server/axios';

import type { LogService } from '../index';

type HttpClientServiceParameters = {
	logService: LogService;
};

export const HttpClientService = ({ logService }: HttpClientServiceParameters) => ({
	createClient: (baseURL: string) => getAxiosInstance(baseURL, logService('httpClient'))
});

export type HttpClientService = ReturnType<typeof HttpClientService>;

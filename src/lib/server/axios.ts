import axios, { type InternalAxiosRequestConfig } from 'axios';

import type { ChildLogger } from './log';

interface TimestampedAxiosRequestConfig extends InternalAxiosRequestConfig {
	startTime?: number;
}

export const getAxiosInstance = (baseURL: string, outLogger: ChildLogger) => {
	const result = axios.create({
		baseURL,
		timeout: 5 * 1000,
		headers: { application: 'flagflow' }
	});
	result.interceptors.request.use(
		(config: TimestampedAxiosRequestConfig) => {
			outLogger.debug(
				{
					url: (config.baseURL || '') + config.url,
					params: config.params,
					method: config.method
				},
				`${config.method?.toUpperCase()} request to ${config.baseURL || config.url}`
			);
			config.startTime = Date.now();
			return config;
		},
		(error) => {
			outLogger.error(error instanceof Error ? error.message : error);
			return Promise.reject(error);
		}
	);
	result.interceptors.response.use(
		(response) => {
			const elapsedMs =
				Date.now() - ((response.config as TimestampedAxiosRequestConfig).startTime || 0);
			outLogger.debug(
				{
					status: response.status,
					elapsed: elapsedMs,
					contentType: response.headers['Content-Type'] || response.headers['content-type']
				},
				`${response.config.method?.toUpperCase()} response from ${response.config.baseURL || response.config.url}`
			);
			return response;
		},
		(error) => {
			outLogger.error(error instanceof Error ? error.message : error);
			return Promise.reject(error);
		}
	);
	return result;
};

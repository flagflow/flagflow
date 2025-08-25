import { hostname } from 'node:os';

import type { Handle } from '@sveltejs/kit';
import { Counter, register } from 'prom-client';

import { config } from '../config';

export const URI_METRICS = '/metrics';
export const METRICS_ENABLED = config.metrics.enabled;

register.clear();
register.setDefaultLabels({ hostname: hostname() });

const METRIC_PREFIX = 'flagflow_';

export const createCounter = (parameters: {
	name: string;
	help: string;
	labelNames?: readonly string[];
}) =>
	parameters.labelNames
		? new Counter({
				name: `${METRIC_PREFIX}${parameters.name}`,
				help: parameters.help,
				labelNames: parameters.labelNames
			})
		: new Counter({
				name: `${METRIC_PREFIX}${parameters.name}`,
				help: parameters.help
			});

export const createMetricsHandle: Handle = async ({ event, resolve }) => {
	if (METRICS_ENABLED && event.url.pathname === URI_METRICS) {
		const metricString = await register.metrics();
		register.resetMetrics();

		return new Response(metricString, {
			headers: { 'Content-Type': register.contentType }
		});
	}

	return resolve(event);
};

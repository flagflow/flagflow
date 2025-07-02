import type { ChildLogger } from './log';
import { createCounter, METRICS_ENABLED } from './svelteMiddleware/metrics';

const cacheMetric = METRICS_ENABLED
	? {
			hit: createCounter({
				name: 'cache_hit',
				help: 'Cache hit',
				labelNames: ['module', 'name', 'key']
			}),
			miss: createCounter({
				name: 'cache_miss',
				help: 'Cache miss',
				labelNames: ['module', 'name', 'key']
			})
		}
	: undefined;

export class PipeCache<T extends object> {
	private stat = {
		hit: 0,
		miss: 0
	};
	private lastSetAt: number = 0;
	private value: T | undefined;

	constructor(
		private name: { module: string; name: string },
		private timeoutSec: number
	) {}

	public getStat = () => this.stat;

	private set(value: T) {
		this.value = value;
		this.lastSetAt = Date.now();
	}

	public reset() {
		this.value = undefined;
		this.lastSetAt = Date.now() - 2 * this.timeoutSec * 1000;
	}

	public async pipe(source: () => Promise<T>, logger?: ChildLogger): Promise<T> {
		if (this.value && Date.now() - this.lastSetAt < this.timeoutSec * 1000) {
			this.stat.hit++;
			logger?.trace('Cache hit');
			cacheMetric?.hit.inc({ module: this.name.module, name: this.name.name });
			return this.value;
		}
		this.stat.miss++;
		logger?.trace('Load cache');
		cacheMetric?.miss.inc({ module: this.name.module, name: this.name.name });
		const freshData = await source();
		this.set(freshData);
		return freshData;
	}
}

export class PipeArrayCache<T extends object> {
	private stat = {
		hit: 0,
		miss: 0
	};
	private lastSetAt: number = 0;
	private data: T[] = [];

	constructor(
		private name: { module: string; name: string },
		private timeoutSec: number
	) {}

	public getStat = () => this.stat;

	private set(items: T[]) {
		this.data = items;
		this.lastSetAt = Date.now();
	}

	public reset() {
		this.lastSetAt = Date.now() - 2 * this.timeoutSec * 1000;
	}

	public async pipe(source: () => Promise<T[]>, logger?: ChildLogger): Promise<T[]> {
		if (Date.now() - this.lastSetAt < this.timeoutSec * 1000) {
			this.stat.hit++;
			logger?.trace('Cache hit');
			cacheMetric?.hit.inc({ module: this.name.module, name: this.name.name });
			return this.data;
		}
		this.stat.miss++;
		logger?.trace('Load cache');
		cacheMetric?.miss.inc({ module: this.name.module, name: this.name.name });
		const freshData = await source();
		this.set(freshData);
		return freshData;
	}
}

export class PipeKeyCache<K, T> {
	private stat = {
		hit: 0,
		miss: 0
	};
	private values: Map<string, { lastSetAt: number; value: T }> = new Map();

	constructor(
		private name: { module: string; name: string },
		private timeoutSec: number
	) {}

	public getStat = () => this.stat;

	public reset = () => this.values.clear();

	public async pipe(key: K, source: (key: K) => Promise<T>, logger?: ChildLogger): Promise<T> {
		const keyString = JSON.stringify(key);
		const data = this.values.get(keyString);
		if (data && Date.now() - data.lastSetAt < this.timeoutSec * 1000) {
			this.stat.hit++;
			logger?.trace('Cache hit');
			cacheMetric?.hit.inc({ module: this.name.module, name: this.name.name, key: keyString });
			return data.value;
		}
		this.stat.miss++;
		logger?.trace('Load cache');
		cacheMetric?.miss.inc({ module: this.name.module, name: this.name.name, key: keyString });
		const freshData = await source(key);
		this.values.set(keyString, { lastSetAt: Date.now(), value: freshData });
		return freshData;
	}
}

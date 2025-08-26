import type {
	PersistentEngine,
	PersistentEngineWatcherCallback,
	PersistentEngineWatcherClose
} from '$lib/server/persistent/types';
import type { PersistentSchemaKey } from '$types/persistent';

export class InMemoryPersistentEngine implements PersistentEngine {
	private data = new Map<string, string>();
	private watchers = new Map<string, Set<PersistentEngineWatcherCallback>>();

	getPrefix(store: PersistentSchemaKey): string {
		return `${store}/`;
	}

	getKey(store: PersistentSchemaKey, name: string): string {
		return `${store}/${name}`;
	}

	async exists(key: string): Promise<boolean> {
		return this.data.has(key);
	}

	async list(prefix: string): Promise<Record<string, string>> {
		const result: Record<string, string> = {};
		for (const [key, value] of this.data.entries()) if (key.startsWith(prefix)) result[key] = value;

		return result;
	}

	async get(key: string): Promise<string | undefined> {
		return this.data.get(key);
	}

	async put(key: string, value: string): Promise<void> {
		const wasExisting = this.data.has(key);
		this.data.set(key, value);

		// Notify watchers
		const prefix = this.findPrefixForKey(key);
		if (prefix) {
			const callbacks = this.watchers.get(prefix);
			if (callbacks)
				for (const callback of callbacks) callback(wasExisting ? 'data' : 'data', key, value);
		}
	}

	async delete(key: string): Promise<void> {
		const existed = this.data.delete(key);

		if (existed) {
			// Notify watchers
			const prefix = this.findPrefixForKey(key);
			if (prefix) {
				const callbacks = this.watchers.get(prefix);
				if (callbacks) for (const callback of callbacks) callback('delete', key);
			}
		}
	}

	async watch(
		prefix: string,
		onEvent: PersistentEngineWatcherCallback
	): Promise<PersistentEngineWatcherClose> {
		if (!this.watchers.has(prefix)) this.watchers.set(prefix, new Set());

		const callbacks = this.watchers.get(prefix)!;
		callbacks.add(onEvent);

		return {
			stop: async () => {
				callbacks.delete(onEvent);
				if (callbacks.size === 0) this.watchers.delete(prefix);
			}
		};
	}

	async close(): Promise<void> {
		this.data.clear();
		this.watchers.clear();
	}

	async status(): Promise<string> {
		return `InMemory engine with ${this.data.size} keys`;
	}

	// Helper methods for testing
	clear(): void {
		this.data.clear();
		this.watchers.clear();
	}

	getAllData(): Record<string, string> {
		return Object.fromEntries(this.data.entries());
	}

	private findPrefixForKey(key: string): string | undefined {
		for (const prefix of this.watchers.keys()) if (key.startsWith(prefix)) return prefix;

		return undefined;
	}
}

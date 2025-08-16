import type { PersistentSchemaKey } from '$types/persistent';

export type PersistentConfig =
	| {
			mode: 'fileSystem';
			rootFolder: string;
	  }
	| {
			mode: 'etcd';
			server: string;
			username: string | undefined;
			password: string | undefined;
			namespace: string;
	  };

export type PersistentEngineWatcherCallback = (
	event: 'data' | 'delete',
	key: string,
	value?: string | undefined
) => void;

export type PersistentEngineWatcherClose = {
	stop: () => Promise<void>;
};

export type PersistentEngine = {
	getPrefix(store: PersistentSchemaKey): string;
	getKey(store: PersistentSchemaKey, name: string): string;
	exists(key: string): Promise<boolean>;
	list(prefix: string): Promise<Record<string, string>>;

	get(key: string): Promise<string | undefined>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;

	watch(
		prefix: string,
		onEvent: PersistentEngineWatcherCallback
	): Promise<PersistentEngineWatcherClose>;
	close(): Promise<void>;
	status(): Promise<string>;
};

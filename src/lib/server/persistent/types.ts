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

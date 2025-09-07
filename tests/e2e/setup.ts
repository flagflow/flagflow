import { asFunction, asValue, type AwilixContainer, createContainer } from 'awilix';

import { generateTraceId } from '$lib/genId';
import { createRpcCallerFactory } from '$lib/rpc/init';
import type { RpcRouter } from '$lib/rpc/router';
import { router } from '$lib/rpc/router';
import {
	ConfigService,
	FlagService,
	GlobalLogService,
	HttpClientService,
	LogService,
	SessionService,
	UserService
} from '$lib/server/services';
import { MaintenanceService } from '$lib/server/services/coreServices/MaintenanceService';
import type { UserPermission } from '$types/UserPermissions';

import { MockPersistentService } from '../mocks/MockPersistentService';

type TestContainer = {
	traceId: string;
	userName: string | undefined;

	configService: ConfigService;
	globalLogService: GlobalLogService;
	logService: LogService;
	persistentService: ReturnType<typeof MockPersistentService>;
	httpClientService: HttpClientService;

	maintenanceService: MaintenanceService;
	sessionService: SessionService;
	userService: UserService;
	flagService: FlagService;
};

export interface E2ETestContext {
	container: AwilixContainer<TestContainer>;
	rpcCaller: ReturnType<ReturnType<typeof createRpcCallerFactory<RpcRouter['_def']['procedures']>>>;
	cleanup: () => Promise<void>;
}

export interface TestUser {
	userName: string;
	permissions: UserPermission[];
}

export const createE2ETestContext = async (testUser?: TestUser): Promise<E2ETestContext> => {
	// Create container with in-memory persistence
	const testContainer = createContainer<TestContainer>({ strict: true }).register({
		configService: asFunction(() => ({
			...ConfigService(),
			environment: '' // Override environment to empty string for consistent test results
		})).singleton(),

		globalLogService: asFunction(GlobalLogService).scoped(),
		logService: asFunction(LogService).scoped(),
		persistentService: asFunction(MockPersistentService).scoped(),
		httpClientService: asFunction(HttpClientService).scoped(),

		maintenanceService: asFunction(MaintenanceService).scoped(),
		sessionService: asFunction(SessionService).scoped(),
		userService: asFunction(UserService).scoped(),
		flagService: asFunction(FlagService).scoped()
	});

	// Create scope with test user context
	const scope = testContainer.createScope();
	scope.register({
		traceId: asValue(generateTraceId()),
		userName: asValue(testUser?.userName)
	});

	// Create mock context for RPC calls
	const mockContext = {
		container: scope,
		logger: scope.resolve('logService'),
		authentication: testUser
			? {
					type: 'SESSION' as const,
					sessionId: 'test-session',
					success: {
						userName: testUser.userName,
						permissions: testUser.permissions
					}
				}
			: {
					type: 'NONE' as const
				}
	};

	// Create RPC caller
	const callerFactory = createRpcCallerFactory(router);
	const rpcCaller = callerFactory(mockContext);

	const cleanup = async () => {
		await testContainer.dispose();
	};

	return {
		container: scope,
		rpcCaller,
		cleanup
	};
};

export const createTestFlag = (overrides: Record<string, unknown> = {}) => ({
	description: 'A test flag for E2E testing',
	type: 'BOOLEAN' as const,
	valueExists: true,
	value: true,
	defaultValue: false,
	isKillSwitch: false,
	...overrides
});

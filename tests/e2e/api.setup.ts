import { createContainer, asFunction, asValue } from 'awilix';
import type { RequestEvent } from '@sveltejs/kit';

import { generateTraceId } from '$lib/genId';
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

export interface APITestClient {
	get: (url: string, options?: RequestOptions) => Promise<Response>;
	post: (url: string, body?: unknown, options?: RequestOptions) => Promise<Response>;
	put: (url: string, body?: unknown, options?: RequestOptions) => Promise<Response>;
	patch: (url: string, body?: unknown, options?: RequestOptions) => Promise<Response>;
	delete: (url: string, options?: RequestOptions) => Promise<Response>;
}

export interface RequestOptions {
	headers?: Record<string, string>;
	searchParams?: URLSearchParams;
}

export interface APITestContext {
	client: APITestClient;
	container: Awaited<ReturnType<typeof createContainer>>;
	cleanup: () => Promise<void>;
}

// Global container for sharing data between test contexts
let sharedTestContainer: Awaited<ReturnType<typeof createContainer>> | null = null;

export interface TestUser {
	userName: string;
	permissions: UserPermission[];
}

/**
 * Creates a test context with REST API client for testing API endpoints
 */
export const createAPITestContext = async (
	testUser?: TestUser,
	useSharedContainer = false
): Promise<APITestContext> => {
	let testContainer: Awaited<ReturnType<typeof createContainer>>;

	if (useSharedContainer && sharedTestContainer) {
		testContainer = sharedTestContainer;
	} else {
		// Create container with in-memory persistence (same as RPC tests)
		testContainer = createContainer({ strict: true }).register({
			configService: asFunction(() => ({
				...ConfigService(),
				environment: '' // Override environment for consistent test results
			})).singleton(),

			globalLogService: asFunction(GlobalLogService).scoped(),
			logService: asFunction(LogService).scoped(),
			persistentService: asFunction(MockPersistentService).scoped(),
			httpClientService: asFunction(HttpClientService).scoped(),

			// Create a mock maintenance service that doesn't do initialization
			maintenanceService: asFunction(() => ({
				// Empty maintenance service to prevent initialization
			})).scoped(),
			sessionService: asFunction(SessionService).scoped(),
			userService: asFunction(UserService).scoped(),
			flagService: asFunction(FlagService).scoped()
		});

		if (useSharedContainer) {
			sharedTestContainer = testContainer;
		}
	}

	// Create scope with test user context
	const scope = testContainer.createScope();
	scope.register({
		traceId: asValue(generateTraceId()),
		userName: asValue(testUser?.userName)
	});

	// Create HTTP client for API calls
	const client = createHTTPClient(scope, testUser);

	const cleanup = async () => {
		if (!useSharedContainer) {
			await testContainer.dispose();
		}
		// Don't dispose shared container here - it should be disposed by the test cleanup
	};

	return {
		client,
		container: scope,
		cleanup
	};
};

/**
 * Resets the shared container (useful for test cleanup)
 */
export const resetSharedContainer = async () => {
	if (sharedTestContainer) {
		await sharedTestContainer.dispose();
		sharedTestContainer = null;
	}
};

/**
 * Creates an HTTP client that simulates SvelteKit request handling
 */
const createHTTPClient = (
	container: Awaited<ReturnType<typeof createContainer>>,
	testUser?: TestUser
): APITestClient => {
	const makeRequest = async (
		method: string,
		url: string,
		body?: unknown,
		options?: RequestOptions
	): Promise<Response> => {
		// Construct full URL
		const fullUrl = url.startsWith('http') ? url : `http://localhost:5173${url}`;
		const urlObj = new URL(fullUrl);

		// Add search params if provided
		if (options?.searchParams) {
			for (const [key, value] of options.searchParams) {
				urlObj.searchParams.set(key, value);
			}
		}

		// Prepare headers
		const headers = new Headers(options?.headers || {});

		// Add authentication header if test user is provided
		if (testUser) {
			// Simulate JWT Bearer token (in real app this would be a valid JWT)
			headers.set('Authorization', `Bearer test-session-${testUser.userName}`);
		}

		// Add Content-Type for requests with body
		if (body && !headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		// Create mock Request
		const request = new Request(urlObj.toString(), {
			method,
			headers,
			body: body ? JSON.stringify(body) : null
		});

		// Create mock RequestEvent
		const event: RequestEvent = {
			request,
			url: urlObj,
			params: extractParams(url),
			route: { id: url },
			locals: {},
			cookies: {
				get: () => undefined,
				getAll: () => [],
				set: () => {},
				delete: () => {},
				serialize: () => ''
			},
			fetch: globalThis.fetch,
			getClientAddress: () => '127.0.0.1',
			isDataRequest: false,
			isSubRequest: false,
			platform: undefined,
			setHeaders: () => {}
		} as any;

		// Set up locals with authentication context (similar to middleware)
		await setupLocals(event, container, testUser);

		// Import and call the appropriate route handler
		try {
			const handler = await importRouteHandler(url, method);
			return await handler(event);
		} catch (error) {
			// Check if this is a SvelteKit error response (thrown by error() function)
			if (error && typeof error === 'object' && 'status' in error && 'body' in error) {
				// This is a SvelteKit HttpError - convert to proper HTTP response
				const httpError = error as { status: number; body: { message: string } };

				return new Response(JSON.stringify(httpError.body), {
					status: httpError.status,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			// Return error response if handler fails
			return new Response(
				JSON.stringify({ message: (error as Error).message, stack: (error as Error).stack }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
	};

	return {
		get: (url, options) => makeRequest('GET', url, undefined, options),
		post: (url, body, options) => makeRequest('POST', url, body, options),
		put: (url, body, options) => makeRequest('PUT', url, body, options),
		patch: (url, body, options) => makeRequest('PATCH', url, body, options),
		delete: (url, options) => makeRequest('DELETE', url, undefined, options)
	};
};

/**
 * Sets up locals object similar to SvelteKit middleware
 */
const setupLocals = async (event: RequestEvent, container: any, testUser?: TestUser) => {
	// Set up container in locals
	event.locals.container = container;

	// Set up authentication context
	if (testUser) {
		event.locals.authentication = {
			type: 'SESSION',
			sessionId: `test-session-${testUser.userName}`,
			success: {
				userName: testUser.userName,
				permissions: testUser.permissions,
				passwordExpired: false
			}
		};
	} else {
		event.locals.authentication = {
			type: 'NONE',
			success: undefined
		};
	}

	// Create RPC caller manually using the same pattern as createLocalContext but with our test container
	const { createRpcCallerFactory } = await import('$lib/rpc/init');
	const { router } = await import('$lib/rpc/router');

	const mockContext = {
		container,
		logger: container.resolve('logService'),
		authentication: event.locals.authentication
	};

	const callerFactory = createRpcCallerFactory(router);
	event.locals.rpcCaller = callerFactory(mockContext);
};

/**
 * Extracts path parameters from URL
 */
const extractParams = (url: string): Record<string, string> => {
	const params: Record<string, string> = {};

	// Extract actual parameter values from URL paths
	if (url.match(/^\/api\/users\/([^/]+)$/)) {
		const match = url.match(/^\/api\/users\/([^/]+)$/);
		if (match) params['key'] = match[1];
	}

	return params;
};

/**
 * Dynamically imports the appropriate route handler based on URL and method
 */
const importRouteHandler = async (url: string, method: string) => {
	// Map URL patterns to file paths - use relative imports from the test directory
	const routeMapping = {
		'/api': () => import('../../src/routes/api/+server.js'),
		'/api/login': () => import('../../src/routes/api/login/+server.js'),
		'/api/logout': () => import('../../src/routes/api/logout/+server.js'),
		'/api/users': () => import('../../src/routes/api/(protected)/users/+server.js'),
		'/api/sessions': () => import('../../src/routes/api/(protected)/sessions/+server.js')
	};

	// Handle parameterized routes
	let routeHandler;
	if (url.match(/^\/api\/users\/[^/]+$/)) {
		routeHandler = await import('../../src/routes/api/(protected)/users/[key=key]/+server.js');
	} else if (url.match(/^\/api\/sessions\/[^/]+$/)) {
		routeHandler = await import(
			'../../src/routes/api/(protected)/sessions/[id=sessionkey]/+server.js'
		);
	} else {
		// Try exact match
		const importFn = routeMapping[url as keyof typeof routeMapping];
		if (!importFn) {
			throw new Error(`No route handler found for ${url}`);
		}
		routeHandler = await importFn();
	}

	// Get the appropriate HTTP method handler
	const handler = (routeHandler as any)[method];
	if (!handler) {
		throw new Error(`Method ${method} not supported for ${url}`);
	}

	return handler as (event: any) => Promise<Response>;
};

/**
 * Helper to create test user data
 */
export const createTestUser = (
	overrides: Partial<{
		key: string;
		name: string;
		password: string;
		permissions: UserPermission[];
		mustChangePassword: boolean;
	}> = {}
) => ({
	key: 'test.api.user',
	name: 'Test API User',
	password: 'test-password',
	permissions: ['flag-value'] as UserPermission[],
	mustChangePassword: false,
	...overrides
});

/**
 * Helper to parse JSON response safely
 */
export const parseJSONResponse = async (response: Response) => {
	const text = await response.text();
	try {
		return JSON.parse(text);
	} catch {
		return { text };
	}
};

/**
 * Helper to get session token from login response
 */
export const loginAndGetToken = async (
	client: APITestClient,
	username: string,
	password: string
): Promise<string> => {
	const response = await client.post('/api/login', { username, password });
	const data = await parseJSONResponse(response);

	if (!response.ok) {
		throw new Error(`Login failed: ${data.message || 'Unknown error'}`);
	}

	return data.session || `test-session-${username}`;
};

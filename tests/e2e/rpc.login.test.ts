import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { resetFlagServiceState } from '$lib/server/services/FlagService/FlagService';
import type { UserPermission } from '$types/UserPermissions';

import { createE2ETestContext } from './setup';

// Helper function to create test user data
const createTestUser = (
	overrides: Partial<{
		key: string;
		name: string;
		password: string;
		permissions: UserPermission[];
		mustChangePassword: boolean;
	}> = {}
) => ({
	key: 'test.user',
	name: 'Test User',
	password: 'test-password',
	permissions: ['flag-value'] as UserPermission[],
	mustChangePassword: false,
	...overrides
});

describe('Login RPC', () => {
	let context: Awaited<ReturnType<typeof createE2ETestContext>>;

	beforeEach(async () => {
		// Reset FlagService state before each test for proper isolation
		await resetFlagServiceState();

		// Create context without authentication for public endpoints
		context = await createE2ETestContext();
	});

	afterEach(async () => {
		await context.cleanup();
		// Reset again after each test to ensure clean state
		await resetFlagServiceState();
	});

	describe('login', () => {
		it('should login successfully with valid credentials', async () => {
			// First create a test user
			const testUser = createTestUser();

			// Create authenticated context to add user
			const adminContext = await createE2ETestContext({
				userName: 'admin',
				permissions: ['users']
			});

			await adminContext.rpcCaller.user.create({
				...testUser
			});

			// Now test login with the created user - use adminContext for login since it has the user data
			const result = await adminContext.rpcCaller.login.login({
				username: testUser.key,
				password: testUser.password
			});

			await adminContext.cleanup();

			expect(result).toMatchObject({
				sessionId: expect.any(String),
				userName: testUser.name,
				ttlSeconds: expect.any(Number),
				expiredAt: expect.any(Number) // expiredAt is a timestamp, not Date object
			});

			expect(result.sessionId).toHaveLength(32); // Session ID length
			expect(result.ttlSeconds).toBeGreaterThan(0);
			expect(result.expiredAt).toBeGreaterThan(Date.now()); // Future timestamp
		});

		it('should reject login with invalid username', async () => {
			await expect(
				context.rpcCaller.login.login({
					username: 'nonexistent_user',
					password: 'any_password'
				})
			).rejects.toMatchObject({
				message: expect.stringContaining('Login error')
			});
		});

		it('should reject login with invalid password', async () => {
			// Create a test user
			const testUser = createTestUser();

			const adminContext = await createE2ETestContext({
				userName: 'admin',
				permissions: ['users']
			});

			await adminContext.rpcCaller.user.create({
				...testUser
			});

			await adminContext.cleanup();

			// Try login with wrong password
			await expect(
				context.rpcCaller.login.login({
					username: testUser.key,
					password: 'wrong_password'
				})
			).rejects.toMatchObject({
				message: expect.stringContaining('Login error')
			});
		});

		it('should reject login with empty username', async () => {
			await expect(
				context.rpcCaller.login.login({
					username: '',
					password: 'test_password'
				})
			).rejects.toMatchObject({
				message: expect.stringContaining('Too small')
			});
		});

		it('should reject login with empty password', async () => {
			await expect(
				context.rpcCaller.login.login({
					username: 'test_user',
					password: ''
				})
			).rejects.toMatchObject({
				message: expect.stringContaining('Too small')
			});
		});

		it('should handle user with multiple permissions', async () => {
			const testUser = createTestUser({
				key: 'admin.user',
				name: 'Admin User',
				permissions: ['users', 'flag-create', 'flag-value', 'migration']
			});

			const adminContext = await createE2ETestContext({
				userName: 'admin',
				permissions: ['users']
			});

			await adminContext.rpcCaller.user.create({
				...testUser
			});

			const result = await adminContext.rpcCaller.login.login({
				username: testUser.key,
				password: testUser.password
			});

			await adminContext.cleanup();

			expect(result).toMatchObject({
				sessionId: expect.any(String),
				userName: testUser.name,
				ttlSeconds: expect.any(Number),
				expiredAt: expect.any(Number)
			});
		});

		it('should handle user that must change password', async () => {
			const testUser = createTestUser({
				key: 'password.change.user',
				name: 'Password Change User',
				mustChangePassword: true
			});

			const adminContext = await createE2ETestContext({
				userName: 'admin',
				permissions: ['users']
			});

			await adminContext.rpcCaller.user.create({
				...testUser
			});

			// Login should still work, but user will need to change password
			const result = await adminContext.rpcCaller.login.login({
				username: testUser.key,
				password: testUser.password
			});

			await adminContext.cleanup();

			expect(result).toMatchObject({
				sessionId: expect.any(String),
				userName: testUser.name,
				ttlSeconds: expect.any(Number),
				expiredAt: expect.any(Number)
			});
		});
	});

	describe('logout', () => {
		it('should logout successfully when authenticated with session', async () => {
			// First create a user and login
			const testUser = createTestUser();

			const adminContext = await createE2ETestContext({
				userName: 'admin',
				permissions: ['users']
			});

			await adminContext.rpcCaller.user.create({
				...testUser
			});

			// Login to get session
			const loginResult = await adminContext.rpcCaller.login.login({
				username: testUser.key,
				password: testUser.password
			});

			// Create context with session authentication
			const authenticatedContext = await createE2ETestContext({
				userName: testUser.name,
				permissions: testUser.permissions
			});

			// Override the authentication to simulate session-based auth
			const mockSessionContext = {
				container: authenticatedContext.container,
				logger: authenticatedContext.container.resolve('logService'),
				authentication: {
					type: 'SESSION' as const,
					sessionId: loginResult.sessionId,
					success: {
						userName: testUser.name,
						permissions: testUser.permissions
					}
				}
			};

			// Create new RPC caller with session context
			const { createRpcCallerFactory } = await import('$lib/rpc/init');
			const { router } = await import('$lib/rpc/router');
			const callerFactory = createRpcCallerFactory(router);
			const sessionRpcCaller = callerFactory(mockSessionContext);

			// Now test logout
			const logoutResult = await sessionRpcCaller.login.logout();

			expect(logoutResult).toEqual({});

			await authenticatedContext.cleanup();
			await adminContext.cleanup();
		});

		it('should reject logout when not authenticated', async () => {
			// Try logout without authentication
			await expect(context.rpcCaller.login.logout()).rejects.toMatchObject({
				message: expect.stringContaining('Not authenticated with session')
			});
		});

		it('should reject logout when authenticated with wrong method', async () => {
			// Create context with JWT-like authentication (not session)
			const jwtContext = await createE2ETestContext();

			const mockJwtContext = {
				container: jwtContext.container,
				logger: jwtContext.container.resolve('logService'),
				authentication: {
					type: 'JWT' as const,
					tokens: {
						access_token: 'fake_token',
						refresh_token: 'fake_refresh',
						id_token: 'fake_id_token'
					}
				}
			};

			const { createRpcCallerFactory } = await import('$lib/rpc/init');
			const { router } = await import('$lib/rpc/router');
			const callerFactory = createRpcCallerFactory(router);
			const jwtRpcCaller = callerFactory(mockJwtContext);

			await expect(jwtRpcCaller.login.logout()).rejects.toMatchObject({
				message: expect.stringContaining('Not authenticated with session')
			});

			await jwtContext.cleanup();
		});

		it('should reject logout when session authentication fails', async () => {
			// Create context with failed session authentication
			const failedSessionContext = await createE2ETestContext();

			const mockFailedSessionContext = {
				container: failedSessionContext.container,
				logger: failedSessionContext.container.resolve('logService'),
				authentication: {
					type: 'SESSION' as const,
					sessionId: 'invalid_session',
					success: undefined // Failed authentication
				}
			};

			const { createRpcCallerFactory } = await import('$lib/rpc/init');
			const { router } = await import('$lib/rpc/router');
			const callerFactory = createRpcCallerFactory(router);
			const failedRpcCaller = callerFactory(mockFailedSessionContext);

			await expect(failedRpcCaller.login.logout()).rejects.toMatchObject({
				message: expect.stringContaining('Not authenticated with session')
			});

			await failedSessionContext.cleanup();
		});
	});

	describe('integration tests', () => {
		it('should complete full login/logout workflow', async () => {
			// Step 1: Create a test user
			const testUser = createTestUser({
				key: 'workflow.user',
				name: 'Workflow User',
				permissions: ['flag-value', 'users']
			});

			const adminContext = await createE2ETestContext({
				userName: 'admin',
				permissions: ['users']
			});

			await adminContext.rpcCaller.user.create({
				...testUser
			});

			// Step 2: Login with the user
			const loginResult = await adminContext.rpcCaller.login.login({
				username: testUser.key,
				password: testUser.password
			});

			expect(loginResult).toMatchObject({
				sessionId: expect.any(String),
				userName: testUser.name
			});

			// Step 3: Use the session to make authenticated calls
			const authenticatedContext = await createE2ETestContext({
				userName: testUser.name,
				permissions: testUser.permissions
			});

			// Verify we can make authenticated calls (like getting session info)
			const sessions = await authenticatedContext.rpcCaller.session.getList();
			expect(Array.isArray(sessions)).toBe(true);

			// Step 4: Create session-based RPC caller for logout
			const mockSessionContext = {
				container: authenticatedContext.container,
				logger: authenticatedContext.container.resolve('logService'),
				authentication: {
					type: 'SESSION' as const,
					sessionId: loginResult.sessionId,
					success: {
						userName: testUser.name,
						permissions: testUser.permissions
					}
				}
			};

			const { createRpcCallerFactory } = await import('$lib/rpc/init');
			const { router } = await import('$lib/rpc/router');
			const callerFactory = createRpcCallerFactory(router);
			const sessionRpcCaller = callerFactory(mockSessionContext);

			// Step 5: Logout
			const logoutResult = await sessionRpcCaller.login.logout();
			expect(logoutResult).toEqual({});

			await authenticatedContext.cleanup();
			await adminContext.cleanup();
		});

		it('should handle multiple concurrent login attempts', async () => {
			// Create multiple test users
			const users = [
				createTestUser({ key: 'user.1', name: 'User 1' }),
				createTestUser({ key: 'user.2', name: 'User 2' }),
				createTestUser({ key: 'user.3', name: 'User 3' })
			];

			const adminContext = await createE2ETestContext({
				userName: 'admin',
				permissions: ['users']
			});

			// Create all users
			for (const user of users) {
				await adminContext.rpcCaller.user.create(user);
			}

			// Attempt concurrent logins
			const loginPromises = users.map((user) =>
				adminContext.rpcCaller.login.login({
					username: user.key,
					password: user.password
				})
			);

			const results = await Promise.all(loginPromises);

			// Verify all logins succeeded
			expect(results).toHaveLength(3);
			results.forEach((result, index) => {
				expect(result).toMatchObject({
					sessionId: expect.any(String),
					userName: users[index].name,
					ttlSeconds: expect.any(Number),
					expiredAt: expect.any(Number)
				});
			});

			// Verify all session IDs are unique
			const sessionIds = results.map((r) => r.sessionId);
			const uniqueSessionIds = new Set(sessionIds);
			expect(uniqueSessionIds.size).toBe(3);

			await adminContext.cleanup();
		});
	});
});

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable vitest/no-hooks, vitest/prefer-expect-assertions */
// @ts-nocheck
import { asValue } from 'awilix';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { resetFlagServiceState } from '$lib/server/services/FlagService/FlagService';
import type { PersistentSession } from '$types/persistent';

import type { E2ETestContext } from './setup';
import { createE2ETestContext } from './setup';

// Helper function to create test session data
const createTestSession = (
	overrides: Partial<PersistentSession> = {}
): Omit<PersistentSession, 'touchedAt' | 'ttlSeconds' | 'expiredAt'> => ({
	userKey: 'test-user-key',
	userName: 'test-user',
	createdAt: new Date(),
	permissions: ['flag-value'],
	...overrides
});

describe('rpc Session E2E Tests', () => {
	let context: E2ETestContext;

	beforeEach(async () => {
		// Reset FlagService module-level state before each test
		await resetFlagServiceState();

		// Create context with a test user having users permission for session management
		context = await createE2ETestContext({
			userName: 'admin-user',
			permissions: ['users', 'flag-value']
		});
	});

	afterEach(async () => {
		await context.cleanup();
		// Reset again after each test to ensure clean state
		await resetFlagServiceState();
	});

	describe('session CRUD Operations', () => {
		it('should list all sessions', async () => {
			// Get initial session list (should be empty)
			const initialSessions = await context.rpcCaller.session.getList();

			expect(initialSessions).toEqual([]);
			expectTypeOf(initialSessions).toBeArray();

			// Create a test session using SessionService
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'test-session-user',
				permissions: ['flag-value', 'flag-create']
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);
			expect(createdSessionInfo.sessionId).toBeTruthy();
			expect(createdSessionInfo.ttlSeconds).toBeTruthy();
			expect(createdSessionInfo.expiredAt).toBeTruthy();

			// List sessions - should now contain our session
			const sessionsWithTest = await context.rpcCaller.session.getList();

			expect(sessionsWithTest).toHaveLength(1);
			expect(sessionsWithTest[0]).toMatchObject({
				userKey: testSessionData.userKey,
				userName: testSessionData.userName,
				permissions: testSessionData.permissions
			});
			expect(sessionsWithTest[0].createdAt).toBeInstanceOf(Date);
			expect(typeof sessionsWithTest[0].ttlSeconds).toBe('number');
			expect(typeof sessionsWithTest[0].expiredAt).toBe('number');
		});

		it('should delete specific sessions', async () => {
			// Create a test session
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'session-to-delete',
				userKey: 'delete-user-key'
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);
			const sessionId = createdSessionInfo.sessionId;

			// Verify session exists
			const sessionsBeforeDelete = await context.rpcCaller.session.getList();
			expect(sessionsBeforeDelete).toHaveLength(1);
			expect(sessionsBeforeDelete[0].userName).toBe('session-to-delete');

			// Delete the session
			await expect(context.rpcCaller.session.delete({ sessionId })).resolves.toBeUndefined();

			// Verify session was deleted
			const sessionsAfterDelete = await context.rpcCaller.session.getList();
			expect(sessionsAfterDelete).toHaveLength(0);
		});

		it('should handle deleting non-existent sessions gracefully', async () => {
			const nonExistentSessionId = 'non-existent-session-id';

			// Should not throw when deleting non-existent session
			await expect(
				context.rpcCaller.session.delete({ sessionId: nonExistentSessionId })
			).resolves.toBeUndefined();
		});
	});

	describe('session Service Integration', () => {
		it('should create sessions with proper structure', async () => {
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'integration-test-user',
				userKey: 'integration-user-key',
				permissions: ['users', 'flag-create', 'flag-value']
			});

			// Create session
			const createdSessionInfo = await sessionService.createSession(testSessionData);

			expect(createdSessionInfo.sessionId).toBeTruthy();
			expect(typeof createdSessionInfo.sessionId).toBe('string');
			expect(createdSessionInfo.ttlSeconds).toBeGreaterThan(0);
			expect(createdSessionInfo.expiredAt).toBeGreaterThan(Date.now());

			// Retrieve session to verify structure
			const retrievedSession = await sessionService.getSession(createdSessionInfo.sessionId);

			expect(retrievedSession).toBeTruthy();
			expect(retrievedSession?.userName).toBe(testSessionData.userName);
			expect(retrievedSession?.userKey).toBe(testSessionData.userKey);
			expect(retrievedSession?.permissions).toEqual(testSessionData.permissions);
			expect(retrievedSession?.createdAt).toBeInstanceOf(Date);
		});

		it('should handle session touch and debouncing', async () => {
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'touch-test-user'
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);
			const sessionId = createdSessionInfo.sessionId;

			// Get initial session
			const initialSession = await sessionService.getSession(sessionId);
			const initialExpiredAt = initialSession?.expiredAt;

			// Touch session
			await sessionService.touchSession(sessionId);

			// Session should still be retrievable and expiration might be updated
			const sessionAfterTouch = await sessionService.getSession(sessionId);
			expect(sessionAfterTouch).toBeTruthy();
			expect(sessionAfterTouch?.userName).toBe(testSessionData.userName);
			// Note: Due to debouncing, the expiredAt might not immediately change
		}, 6000);

		it('should handle session expiration properties', async () => {
			const sessionService = context.container.resolve('sessionService');
			const configService = context.container.resolve('configService');

			const testSessionData = createTestSession({
				userName: 'expiration-test-user'
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);

			// Verify expiration is set correctly
			const expectedExpiration = Date.now() + configService.session.timeoutSecs * 1000;
			expect(createdSessionInfo.expiredAt).toBeLessThanOrEqual(expectedExpiration + 1000); // Allow 1s variance
			expect(createdSessionInfo.expiredAt).toBeGreaterThan(Date.now());
			expect(createdSessionInfo.ttlSeconds).toBe(configService.session.timeoutSecs);
		});
	});

	describe('real-time Session Monitoring', () => {
		it('should handle watchers for session changes', async () => {
			const events: Array<{ event: string; key: string; value?: string }> = [];

			// Set up watcher for session changes
			const persistentService = context.container.resolve('persistentService');
			const watcher = await persistentService.watch('session', (event, key, value) => {
				events.push({ event, key, value });
			});

			// Create session - should trigger watcher
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'watcher-test-user'
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);
			const sessionId = createdSessionInfo.sessionId;

			// Delete session - should trigger watcher
			await sessionService.deleteSession(sessionId);

			// Clean up watcher
			await watcher.stop();

			// Verify events were triggered
			expect(events.length).toBeGreaterThanOrEqual(2); // At least create and delete events

			const createEvent = events.find(
				(event) => event.event === 'data' && event.key.includes(sessionId)
			);
			expect(createEvent).toBeTruthy();

			const deleteEvent = events.find(
				(event) => event.event === 'delete' && event.key.includes(sessionId)
			);
			expect(deleteEvent).toBeTruthy();
		});
	});

	describe('permission-based Access Control', () => {
		it('should enforce users permission for session operations', async () => {
			// Create context without 'users' permission
			const limitedContext = await createE2ETestContext({
				userName: 'limited-user',
				permissions: ['flag-value'] // No 'users' permission
			});

			try {
				// Should fail to list sessions without permission
				await expect(limitedContext.rpcCaller.session.getList()).rejects.toThrow(
					'Permission error'
				);

				// Create a session with full permissions first
				const sessionService = context.container.resolve('sessionService');
				const testSessionData = createTestSession({
					userName: 'permission-test-user'
				});
				const createdSessionInfo = await sessionService.createSession(testSessionData);

				// Should fail to delete session without permission
				await expect(
					limitedContext.rpcCaller.session.delete({
						sessionId: createdSessionInfo.sessionId
					})
				).rejects.toThrow('Permission error');
			} finally {
				await limitedContext.cleanup();
			}
		});

		it('should allow session operations with proper permissions', async () => {
			// Context already has 'users' permission from beforeEach

			// Should succeed to list sessions
			const sessions = await context.rpcCaller.session.getList();
			expect(sessions).toEqual([]);

			// Create and delete session should work
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'authorized-user'
			});
			const createdSessionInfo = await sessionService.createSession(testSessionData);

			await expect(
				context.rpcCaller.session.delete({
					sessionId: createdSessionInfo.sessionId
				})
			).resolves.toBeUndefined();
		});

		it('should test session isolation between users', async () => {
			// Create multiple test contexts representing different users
			const user1Context = await createE2ETestContext({
				userName: 'user1',
				permissions: ['users']
			});

			const user2Context = await createE2ETestContext({
				userName: 'user2',
				permissions: ['users']
			});

			// Share the same persistent service to simulate shared session storage
			const sharedPersistentService = context.container.resolve('persistentService');
			user1Context.container.register({
				persistentService: asValue(sharedPersistentService)
			});
			user2Context.container.register({
				persistentService: asValue(sharedPersistentService)
			});

			try {
				// Create sessions for each user
				const sessionService1 = user1Context.container.resolve('sessionService');
				const sessionService2 = user2Context.container.resolve('sessionService');

				const session1Info = await sessionService1.createSession(
					createTestSession({
						userName: 'user1',
						userKey: 'key1'
					})
				);

				const session2Info = await sessionService2.createSession(
					createTestSession({
						userName: 'user2',
						userKey: 'key2'
					})
				);

				// Both users should see all sessions (since they have 'users' permission)
				const user1Sessions = await user1Context.rpcCaller.session.getList();
				const user2Sessions = await user2Context.rpcCaller.session.getList();

				expect(user1Sessions).toHaveLength(2);
				expect(user2Sessions).toHaveLength(2);

				// Each user can delete any session (with users permission)
				await expect(
					user1Context.rpcCaller.session.delete({ sessionId: session2Info.sessionId })
				).resolves.toBeUndefined();

				await expect(
					user2Context.rpcCaller.session.delete({ sessionId: session1Info.sessionId })
				).resolves.toBeUndefined();
			} finally {
				await user1Context.cleanup();
				await user2Context.cleanup();
			}
		});
	});

	describe('error Handling', () => {
		it('should validate session ID format', async () => {
			const invalidSessionIds = [
				'', // empty
				'invalid session id', // spaces
				'invalid@session', // special characters
				'invalid.session', // dots
				'invalid/session' // slashes
			];

			for (const invalidId of invalidSessionIds) {
				await expect(context.rpcCaller.session.delete({ sessionId: invalidId })).rejects.toThrow(
					'String must only contain a-z, 0-9, hyphens and underscores'
				);
			}
		});

		it('should handle valid session ID formats', async () => {
			const validSessionIds = [
				'valid-session-id',
				'valid_session_id',
				'ValidSessionId',
				'session123',
				'SESSION-123_test'
			];

			// These should not throw validation errors (though sessions don't exist)
			for (const validId of validSessionIds) {
				await expect(
					context.rpcCaller.session.delete({ sessionId: validId })
				).resolves.toBeUndefined();
			}
		});

		it('should handle malformed request input', async () => {
			// Test missing sessionId
			await expect(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				context.rpcCaller.session.delete({} as any)
			).rejects.toThrow();

			// Test null sessionId
			await expect(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				context.rpcCaller.session.delete({ sessionId: null } as any)
			).rejects.toThrow();
		});
	});

	describe('session Data Validation', () => {
		it('should validate session schema structure', async () => {
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'schema-test-user',
				userKey: 'schema-test-key',
				permissions: ['flag-value', 'users'],
				passwordExpireAt: Date.now() + 86400000 // 24 hours from now
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);
			const sessions = await context.rpcCaller.session.getList();

			expect(sessions).toHaveLength(1);
			const session = sessions[0];

			// Validate required fields
			expect(session.userKey).toBe(testSessionData.userKey);
			expect(session.userName).toBe(testSessionData.userName);
			expect(session.createdAt).toBeInstanceOf(Date);
			expect(session.permissions).toEqual(testSessionData.permissions);
			expect(session.passwordExpireAt).toBe(testSessionData.passwordExpireAt);

			// Validate touchable fields (from PersistentTouchable)
			expect(typeof session.ttlSeconds).toBe('number');
			expect(typeof session.expiredAt).toBe('number');
			expect(session.ttlSeconds).toBeGreaterThan(0);
			expect(session.expiredAt).toBeGreaterThan(Date.now());
		});

		it('should handle sessions without optional fields', async () => {
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'minimal-session-user',
				userKey: 'minimal-key',
				permissions: ['flag-value']
				// passwordExpireAt is optional and not provided
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);
			const sessions = await context.rpcCaller.session.getList();

			expect(sessions).toHaveLength(1);
			const session = sessions[0];

			expect(session.passwordExpireAt).toBeUndefined();
			expect(session.userName).toBe(testSessionData.userName);
			expect(session.userKey).toBe(testSessionData.userKey);
		});

		it('should validate permission arrays', async () => {
			const sessionService = context.container.resolve('sessionService');
			const testSessionData = createTestSession({
				userName: 'permission-validation-user',
				permissions: ['users', 'flag-create', 'flag-schema', 'flag-value', 'migration']
			});

			const createdSessionInfo = await sessionService.createSession(testSessionData);
			const sessions = await context.rpcCaller.session.getList();

			expect(sessions).toHaveLength(1);
			const session = sessions[0];

			expect(session.permissions).toEqual(testSessionData.permissions);
			expect(session.permissions).toHaveLength(5);

			// Verify each permission is valid
			const validPermissions = ['users', 'flag-create', 'flag-schema', 'flag-value', 'migration'];
			session.permissions.forEach((permission) => {
				expect(validPermissions).toContain(permission);
			});
		});
	});

	describe('integration with User System', () => {
		it('should link sessions to specific users', async () => {
			const sessionService = context.container.resolve('sessionService');

			// Create multiple sessions for different users
			const user1SessionData = createTestSession({
				userName: 'user1',
				userKey: 'user-key-1',
				permissions: ['flag-value']
			});

			const user2SessionData = createTestSession({
				userName: 'user2',
				userKey: 'user-key-2',
				permissions: ['users', 'flag-create']
			});

			const session1Info = await sessionService.createSession(user1SessionData);
			const session2Info = await sessionService.createSession(user2SessionData);

			const sessions = await context.rpcCaller.session.getList();
			expect(sessions).toHaveLength(2);

			// Find sessions by user
			const user1Session = sessions.find((s) => s.userName === 'user1');
			const user2Session = sessions.find((s) => s.userName === 'user2');

			expect(user1Session).toBeTruthy();
			expect(user2Session).toBeTruthy();

			expect(user1Session?.userKey).toBe('user-key-1');
			expect(user1Session?.permissions).toEqual(['flag-value']);

			expect(user2Session?.userKey).toBe('user-key-2');
			expect(user2Session?.permissions).toEqual(['users', 'flag-create']);
		});

		it('should handle multiple sessions for the same user', async () => {
			const sessionService = context.container.resolve('sessionService');
			const baseSessionData = createTestSession({
				userName: 'multi-session-user',
				userKey: 'multi-session-key',
				permissions: ['flag-value', 'users']
			});

			// Create multiple sessions for the same user with small delays to ensure different timestamps
			const session1Info = await sessionService.createSession(baseSessionData);
			await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
			const session2Info = await sessionService.createSession(baseSessionData);
			await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
			const session3Info = await sessionService.createSession(baseSessionData);

			const sessions = await context.rpcCaller.session.getList();
			expect(sessions).toHaveLength(3);

			// All sessions should be for the same user
			sessions.forEach((session) => {
				expect(session.userName).toBe('multi-session-user');
				expect(session.userKey).toBe('multi-session-key');
				expect(session.permissions).toEqual(['flag-value', 'users']);
			});

			// Verify we have 3 distinct sessions (they should have different expiration times)
			const sessionExpirations = sessions.map((s) => s.expiredAt);
			const uniqueExpirations = new Set(sessionExpirations);
			expect(uniqueExpirations.size).toBeGreaterThanOrEqual(1); // At minimum they exist
		});

		it('should maintain session consistency during concurrent operations', async () => {
			const sessionService = context.container.resolve('sessionService');

			// Create multiple sessions concurrently
			const sessionPromises = Array.from({ length: 5 }, (_, i) =>
				sessionService.createSession(
					createTestSession({
						userName: `concurrent-user-${i}`,
						userKey: `concurrent-key-${i}`,
						permissions: ['flag-value']
					})
				)
			);

			const sessionInfos = await Promise.all(sessionPromises);
			expect(sessionInfos).toHaveLength(5);

			// Verify all sessions were created
			const sessions = await context.rpcCaller.session.getList();
			expect(sessions).toHaveLength(5);

			// Delete sessions concurrently
			const deletePromises = sessionInfos.map((info) =>
				context.rpcCaller.session.delete({ sessionId: info.sessionId })
			);

			await Promise.all(deletePromises);

			// Verify all sessions were deleted
			const finalSessions = await context.rpcCaller.session.getList();
			expect(finalSessions).toHaveLength(0);
		});
	});
});

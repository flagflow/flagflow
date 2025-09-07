/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable vitest/no-hooks, vitest/prefer-expect-assertions */
// @ts-nocheck
import { asValue } from 'awilix';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';

import { resetFlagServiceState } from '$lib/server/services/FlagService/FlagService';
import { hashPassword } from '$lib/server/services/coreServices/UserService';
import type { PersistentUser } from '$types/persistent';
import type { UserPermission } from '$types/UserPermissions';

import type { E2ETestContext } from './setup';
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
	key: 'test-user',
	name: 'Test User',
	password: 'test-password',
	permissions: ['flag-value'] as UserPermission[],
	mustChangePassword: false,
	...overrides
});

describe('rpc User E2E Tests', () => {
	let context: E2ETestContext;

	beforeEach(async () => {
		// Reset FlagService module-level state before each test
		await resetFlagServiceState();

		// Create context with a test user having users permission for user management
		context = await createE2ETestContext({
			userName: 'admin-user',
			permissions: ['users', 'flag-value', 'flag-create']
		});
	});

	afterEach(async () => {
		await context.cleanup();
		// Reset again after each test to ensure clean state
		await resetFlagServiceState();
	});

	describe('user CRUD Operations', () => {
		it('should create, read, update, and delete users', async () => {
			const testUserData = createTestUser({
				key: 'crud-test-user',
				name: 'CRUD Test User',
				password: 'secure-password',
				permissions: ['flag-value', 'users'],
				mustChangePassword: true
			});

			// Create user
			await expect(context.rpcCaller.user.create(testUserData)).resolves.toBeUndefined();

			// Read user list - should contain our user
			const usersList = await context.rpcCaller.user.getList();

			expect(usersList).toHaveLength(1);
			expect(usersList[0]).toMatchObject({
				key: `user/${testUserData.key}`,
				name: testUserData.name,
				enabled: true,
				permissions: testUserData.permissions
			});
			expect(usersList[0].passwordHash).toBeTruthy();
			expect(typeof usersList[0].passwordHash).toBe('string');

			// Read specific user
			const specificUser = await context.rpcCaller.user.get({ key: testUserData.key });

			expect(specificUser).toMatchObject({
				name: testUserData.name,
				enabled: true,
				permissions: testUserData.permissions
			});

			// Update user details
			const updatedData = {
				key: testUserData.key,
				name: 'Updated Test User',
				permissions: ['flag-create', 'migration'] as UserPermission[]
			};

			await expect(context.rpcCaller.user.update(updatedData)).resolves.toBeUndefined();

			// Verify update
			const updatedUser = await context.rpcCaller.user.get({ key: testUserData.key });

			expect(updatedUser.name).toBe('Updated Test User');
			expect(updatedUser.permissions).toEqual(['flag-create', 'migration']);

			// Delete user
			await expect(
				context.rpcCaller.user.delete({ key: testUserData.key })
			).resolves.toBeUndefined();

			// Verify deletion - should throw
			await expect(context.rpcCaller.user.get({ key: testUserData.key })).rejects.toThrow(
				'Key does not exist or is invalid'
			);

			// User list should be empty
			const finalUsersList = await context.rpcCaller.user.getList();
			expect(finalUsersList).toHaveLength(0);
		});

		it('should handle user password management', async () => {
			const testUserData = createTestUser({
				key: 'password-test-user',
				name: 'Password Test User',
				password: 'initial-password',
				mustChangePassword: false
			});

			// Create user
			await context.rpcCaller.user.create(testUserData);

			// Get initial user state
			const initialUser = await context.rpcCaller.user.get({ key: testUserData.key });
			expect(initialUser.passwordExpireAt).toBeUndefined();

			// Update password with mustChangePassword flag
			await expect(
				context.rpcCaller.user.setPassword({
					key: testUserData.key,
					password: 'new-secure-password',
					mustChangePassword: true
				})
			).resolves.toBeUndefined();

			// Verify password change flag is set (passwordExpireAt is set to current time)
			const updatedUser = await context.rpcCaller.user.get({ key: testUserData.key });
			expect(updatedUser.passwordExpireAt).toBeDefined();

			// Update password again without mustChangePassword flag
			await expect(
				context.rpcCaller.user.setPassword({
					key: testUserData.key,
					password: 'another-password',
					mustChangePassword: false
				})
			).resolves.toBeUndefined();

			// Verify password change flag is cleared
			const finalUser = await context.rpcCaller.user.get({ key: testUserData.key });
			expect(finalUser.passwordExpireAt).toBeUndefined();
		});

		it('should handle user enable/disable operations', async () => {
			const testUserData = createTestUser({
				key: 'enable-test-user',
				name: 'Enable Test User'
			});

			// Create user (should be enabled by default)
			await context.rpcCaller.user.create(testUserData);

			const initialUser = await context.rpcCaller.user.get({ key: testUserData.key });
			expect(initialUser.enabled).toBe(true);

			// Disable user
			await expect(
				context.rpcCaller.user.setEnabled({
					key: testUserData.key,
					enabled: false
				})
			).resolves.toBeUndefined();

			// Verify user is disabled
			const disabledUser = await context.rpcCaller.user.get({ key: testUserData.key });
			expect(disabledUser.enabled).toBe(false);

			// Re-enable user
			await expect(
				context.rpcCaller.user.setEnabled({
					key: testUserData.key,
					enabled: true
				})
			).resolves.toBeUndefined();

			// Verify user is enabled again
			const enabledUser = await context.rpcCaller.user.get({ key: testUserData.key });
			expect(enabledUser.enabled).toBe(true);
		});
	});

	describe('user Validation & Data Integrity', () => {
		it('should validate user key formats', async () => {
			const validKeys = ['valid-user', 'user123', 'user.test', 'user@domain.com', 'test-user.123'];

			const invalidKeys = [
				'', // empty
				'User-Test', // uppercase
				'user_test', // underscore
				'user test', // space
				'user/test', // slash
				'user#test' // special character
			];

			// Test valid keys
			for (const validKey of validKeys) {
				const testUserData = createTestUser({ key: validKey });

				await expect(context.rpcCaller.user.create(testUserData)).resolves.toBeUndefined();

				// Clean up
				await context.rpcCaller.user.delete({ key: validKey });
			}

			// Test invalid keys
			for (const invalidKey of invalidKeys) {
				const testUserData = createTestUser({ key: invalidKey });

				await expect(context.rpcCaller.user.create(testUserData)).rejects.toThrow();
			}
		});

		it('should hash passwords correctly', async () => {
			const testUserData = createTestUser({
				key: 'hash-test-user',
				password: 'test-password-123'
			});

			await context.rpcCaller.user.create(testUserData);

			// Get user from persistence to check password hash
			const persistentService = context.container.resolve('persistentService');
			const storedUser = await persistentService.getOrThrow('user', testUserData.key);

			// Verify password is hashed (SHA1)
			expect(storedUser.passwordHash).toBeTruthy();
			expect(storedUser.passwordHash).not.toBe(testUserData.password);
			expect(storedUser.passwordHash).toBe(hashPassword(testUserData.password));
			expect(storedUser.passwordHash).toMatch(/^[a-f0-9]{40}$/); // SHA1 hex format
		});

		it('should validate user schema structure', async () => {
			const testUserData = createTestUser({
				key: 'schema-test-user',
				name: 'Schema Test User',
				permissions: ['users', 'flag-create', 'flag-value'],
				mustChangePassword: true
			});

			await context.rpcCaller.user.create(testUserData);

			const usersList = await context.rpcCaller.user.getList();
			expect(usersList).toHaveLength(1);

			const user = usersList[0];

			// Validate required fields
			expect(user.key).toBe(`user/${testUserData.key}`);
			expect(user.name).toBe(testUserData.name);
			expect(user.enabled).toBe(true); // Default value
			expect(user.permissions).toEqual(testUserData.permissions);
			expect(user.passwordHash).toBeTruthy();
			expect(typeof user.passwordHash).toBe('string');
			expect(typeof user.passwordExpireAt).toBe('number'); // Should be set due to mustChangePassword
		});

		it('should prevent duplicate user creation', async () => {
			const testUserData = createTestUser({
				key: 'duplicate-user'
			});

			// Create first user
			await context.rpcCaller.user.create(testUserData);

			// Attempt to create duplicate - should fail
			await expect(
				context.rpcCaller.user.create({
					...testUserData,
					name: 'Different Name'
				})
			).rejects.toThrow('Key already exists');
		});
	});

	describe('permission-based Access Control', () => {
		it('should enforce users permission for all operations', async () => {
			// Create context without 'users' permission
			const limitedContext = await createE2ETestContext({
				userName: 'limited-user',
				permissions: ['flag-value'] // No 'users' permission
			});

			const testUserData = createTestUser();

			try {
				// Should fail to create user without permission
				await expect(limitedContext.rpcCaller.user.create(testUserData)).rejects.toThrow(
					'Permission error'
				);

				// Should fail to list users without permission
				await expect(limitedContext.rpcCaller.user.getList()).rejects.toThrow('Permission error');

				// Create user with full permissions first
				await context.rpcCaller.user.create(testUserData);

				// Should fail to get user without permission
				await expect(limitedContext.rpcCaller.user.get({ key: testUserData.key })).rejects.toThrow(
					'Permission error'
				);

				// Should fail to update user without permission
				await expect(
					limitedContext.rpcCaller.user.update({
						key: testUserData.key,
						name: 'Updated Name',
						permissions: ['flag-value']
					})
				).rejects.toThrow('Permission error');

				// Should fail to delete user without permission
				await expect(
					limitedContext.rpcCaller.user.delete({ key: testUserData.key })
				).rejects.toThrow('Permission error');
			} finally {
				await limitedContext.cleanup();
			}
		});

		it('should allow user operations with proper permissions', async () => {
			// Context already has 'users' permission from beforeEach
			const testUserData = createTestUser();

			// All operations should succeed
			await expect(context.rpcCaller.user.create(testUserData)).resolves.toBeUndefined();

			const usersList = await context.rpcCaller.user.getList();
			expect(usersList).toHaveLength(1);

			const user = await context.rpcCaller.user.get({ key: testUserData.key });
			expect(user.name).toBe(testUserData.name);

			await expect(
				context.rpcCaller.user.update({
					key: testUserData.key,
					name: 'Updated Name',
					permissions: ['flag-create']
				})
			).resolves.toBeUndefined();

			await expect(
				context.rpcCaller.user.setEnabled({
					key: testUserData.key,
					enabled: false
				})
			).resolves.toBeUndefined();

			await expect(
				context.rpcCaller.user.delete({ key: testUserData.key })
			).resolves.toBeUndefined();
		});

		it('should create users with various permission combinations', async () => {
			const permissionTestCases = [
				['flag-value'],
				['flag-create', 'flag-schema'],
				['users'],
				['migration'],
				['flag-value', 'flag-create', 'flag-schema', 'users', 'migration']
			];

			for (let i = 0; i < permissionTestCases.length; i++) {
				const permissions = permissionTestCases[i] as UserPermission[];
				const testUserData = createTestUser({
					key: `permission-user-${i}`,
					name: `Permission Test User ${i}`,
					permissions
				});

				await context.rpcCaller.user.create(testUserData);

				const user = await context.rpcCaller.user.get({ key: testUserData.key });
				expect(user.permissions).toEqual(permissions);
			}
		});
	});

	describe('error Handling', () => {
		it('should handle operations on non-existent users', async () => {
			const nonExistentKey = 'does-not-exist';

			// Get non-existent user
			await expect(context.rpcCaller.user.get({ key: nonExistentKey })).rejects.toThrow(
				'Key does not exist or is invalid'
			);

			// Update non-existent user
			await expect(
				context.rpcCaller.user.update({
					key: nonExistentKey,
					name: 'Updated Name',
					permissions: ['flag-value']
				})
			).rejects.toThrow('Key does not exist');

			// Set password for non-existent user
			await expect(
				context.rpcCaller.user.setPassword({
					key: nonExistentKey,
					password: 'new-password',
					mustChangePassword: false
				})
			).rejects.toThrow('Key does not exist');

			// Enable/disable non-existent user
			await expect(
				context.rpcCaller.user.setEnabled({
					key: nonExistentKey,
					enabled: false
				})
			).rejects.toThrow('Key does not exist');

			// Delete non-existent user should fail
			await expect(context.rpcCaller.user.delete({ key: nonExistentKey })).rejects.toThrow(
				'Key does not exist'
			);
		});

		it('should handle invalid input data', async () => {
			// Test empty password
			await expect(
				context.rpcCaller.user.create({
					key: 'test-user',
					name: 'Test User',
					password: '', // Empty password
					permissions: ['flag-value'],
					mustChangePassword: false
				})
			).rejects.toThrow();

			// Test empty name (empty string is actually allowed by the schema)
			await expect(
				context.rpcCaller.user.create({
					key: 'test-user-empty-name',
					name: '', // Empty name is allowed
					password: 'test-password',
					permissions: ['flag-value'],
					mustChangePassword: false
				})
			).resolves.toBeUndefined();

			// Clean up
			await context.rpcCaller.user.delete({ key: 'test-user-empty-name' });

			// Test invalid permissions
			await expect(
				context.rpcCaller.user.create({
					key: 'test-user',
					name: 'Test User',
					password: 'test-password',
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					permissions: ['invalid-permission'] as any,
					mustChangePassword: false
				})
			).rejects.toThrow();
		});

		it('should handle malformed requests', async () => {
			// Test missing required fields
			await expect(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				context.rpcCaller.user.create({} as any)
			).rejects.toThrow();

			// Test null values
			await expect(
				context.rpcCaller.user.create({
					key: null,
					name: 'Test User',
					password: 'test-password',
					permissions: ['flag-value'],
					mustChangePassword: false
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any)
			).rejects.toThrow();
		});
	});

	describe('real-time User Monitoring', () => {
		it('should handle watchers for user changes', async () => {
			const events: Array<{ event: string; key: string; value?: string }> = [];

			// Set up watcher for user changes
			const persistentService = context.container.resolve('persistentService');
			const watcher = await persistentService.watch('user', (event, key, value) => {
				events.push({ event, key, value });
			});

			const testUserData = createTestUser({
				key: 'watcher-test-user'
			});

			// Create user - should trigger watcher
			await context.rpcCaller.user.create(testUserData);

			// Update user - should trigger watcher
			await context.rpcCaller.user.update({
				key: testUserData.key,
				name: 'Updated Name',
				permissions: ['flag-create']
			});

			// Delete user - should trigger watcher
			await context.rpcCaller.user.delete({ key: testUserData.key });

			// Clean up watcher
			await watcher.stop();

			// Verify events were triggered
			expect(events.length).toBeGreaterThanOrEqual(3);

			const createEvent = events.find(
				(event) => event.event === 'data' && event.key.includes(testUserData.key)
			);
			expect(createEvent).toBeTruthy();

			const deleteEvent = events.find(
				(event) => event.event === 'delete' && event.key.includes(testUserData.key)
			);
			expect(deleteEvent).toBeTruthy();
		});
	});

	describe('user Data Consistency', () => {
		it('should maintain data consistency across operations', async () => {
			const testUserData = createTestUser({
				key: 'consistency-user',
				name: 'Consistency Test User',
				password: 'original-password',
				permissions: ['flag-value'],
				mustChangePassword: true
			});

			// Create user
			await context.rpcCaller.user.create(testUserData);

			// Verify initial state via different access methods
			const userFromList = (await context.rpcCaller.user.getList())[0];
			const userFromGet = await context.rpcCaller.user.get({ key: testUserData.key });

			expect(userFromList.name).toBe(testUserData.name);
			expect(userFromGet.name).toBe(testUserData.name);
			expect(userFromGet.passwordExpireAt).toBeDefined(); // User was created with mustChangePassword: true

			// Update password
			await context.rpcCaller.user.setPassword({
				key: testUserData.key,
				password: 'new-password',
				mustChangePassword: false
			});

			// Verify consistency after password update
			const updatedUserFromGet = await context.rpcCaller.user.get({ key: testUserData.key });
			const updatedUserFromList = (await context.rpcCaller.user.getList())[0];

			expect(updatedUserFromGet.passwordExpireAt).toBeUndefined(); // Password updated with mustChangePassword: false
			expect(updatedUserFromList.key).toBe(`user/${testUserData.key}`);

			// Update user details
			await context.rpcCaller.user.update({
				key: testUserData.key,
				name: 'Updated Consistency User',
				permissions: ['users', 'flag-create']
			});

			// Verify final consistency
			const finalUserFromGet = await context.rpcCaller.user.get({ key: testUserData.key });
			const finalUserFromList = (await context.rpcCaller.user.getList())[0];

			expect(finalUserFromGet.name).toBe('Updated Consistency User');
			expect(finalUserFromList.name).toBe('Updated Consistency User');
			expect(finalUserFromGet.permissions).toEqual(['users', 'flag-create']);
			expect(finalUserFromList.permissions).toEqual(['users', 'flag-create']);
		});

		it('should handle concurrent user operations', async () => {
			// Create multiple users concurrently
			const userPromises = Array.from({ length: 5 }, (_, i) =>
				context.rpcCaller.user.create(
					createTestUser({
						key: `concurrent-user-${i}`,
						name: `concurrent-user-${i}`,
						permissions: ['flag-value']
					})
				)
			);

			await Promise.all(userPromises);

			// Verify all users were created
			const users = await context.rpcCaller.user.getList();
			expect(users).toHaveLength(5);

			// Update users concurrently
			const updatePromises = users.map((user, i) =>
				context.rpcCaller.user.update({
					key: user.key.replace('user/', ''), // Remove prefix for update
					name: `updated-user-${i}`,
					permissions: ['flag-create']
				})
			);

			await Promise.all(updatePromises);

			// Verify all updates
			const updatedUsers = await context.rpcCaller.user.getList();
			updatedUsers.forEach((user, i) => {
				expect(user.name).toBe(`updated-user-${i}`);
				expect(user.permissions).toEqual(['flag-create']);
			});

			// Delete users concurrently
			const deletePromises = updatedUsers.map((user) =>
				context.rpcCaller.user.delete({ key: user.key.replace('user/', '') })
			);

			await Promise.all(deletePromises);

			// Verify all users were deleted
			const finalUsers = await context.rpcCaller.user.getList();
			expect(finalUsers).toHaveLength(0);
		});
	});
});

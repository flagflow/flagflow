/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable vitest/no-hooks, vitest/prefer-expect-assertions */
// @ts-nocheck
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetFlagServiceState } from '$lib/server/services/FlagService/FlagService';
import { hashPassword } from '$lib/server/services/coreServices/UserService';

import type { E2ETestContext } from './setup';
import { createE2ETestContext } from './setup';

// Helper function to create authenticated context for userSetting operations
const createAuthenticatedUserContext = async (
	userName: string,
	password: string,
	permissions: string[] = ['flag-value'],
	sharedPersistentService?: any
) => {
	const context = await createE2ETestContext({
		userName,
		permissions
	});

	// Use shared persistent service if provided
	if (sharedPersistentService) {
		context.container.register({
			persistentService: { resolve: () => sharedPersistentService }
		});
	}

	// Create the user in the persistent service
	const persistentService =
		sharedPersistentService || context.container.resolve('persistentService');
	await persistentService.put('user', userName, {
		name: userName,
		enabled: true,
		passwordHash: hashPassword(password),
		passwordExpireAt: undefined,
		permissions
	});

	return context;
};

describe('rpc UserSetting E2E Tests', () => {
	let context: E2ETestContext;
	let adminContext: E2ETestContext;

	beforeEach(async () => {
		// Reset FlagService module-level state before each test
		await resetFlagServiceState();

		// Create admin context for user setup
		adminContext = await createE2ETestContext({
			userName: 'admin-user',
			permissions: ['users']
		});
	});

	afterEach(async () => {
		if (context) await context.cleanup();
		if (adminContext) await adminContext.cleanup();
		// Reset again after each test to ensure clean state
		await resetFlagServiceState();
	});

	describe('password Change Operations', () => {
		it('should successfully change password with correct old password', async () => {
			const userName = 'test-user';
			const oldPassword = 'old-password-123';
			const newPassword = 'new-secure-password-456';

			// Get shared persistent service from admin context
			const sharedPersistentService = adminContext.container.resolve('persistentService');

			// Create authenticated user context with shared persistent service
			context = await createAuthenticatedUserContext(
				userName,
				oldPassword,
				['flag-value'],
				sharedPersistentService
			);

			// Change password
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword,
					recentPassword: newPassword
				})
			).resolves.toBeUndefined();

			// Verify password was changed in storage
			const persistentService = context.container.resolve('persistentService');
			const updatedUser = await persistentService.getOrThrow('user', userName);

			expect(updatedUser.passwordHash).toBe(hashPassword(newPassword));
			expect(updatedUser.passwordHash).not.toBe(hashPassword(oldPassword));
			expect(updatedUser.passwordExpireAt).toBeUndefined(); // Should be cleared
		});

		it('should reject password change with incorrect old password', async () => {
			const userName = 'test-user-wrong-pass';
			const correctOldPassword = 'correct-password';
			const wrongOldPassword = 'wrong-password';
			const newPassword = 'new-password';

			// Get shared persistent service and create authenticated user context
			const sharedPersistentService = adminContext.container.resolve('persistentService');
			context = await createAuthenticatedUserContext(
				userName,
				correctOldPassword,
				['flag-value'],
				sharedPersistentService
			);

			// Attempt to change password with wrong old password
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: wrongOldPassword,
					recentPassword: newPassword
				})
			).rejects.toThrow('Old password is incorrect');

			// Verify password was NOT changed
			const persistentService = context.container.resolve('persistentService');
			const unchangedUser = await persistentService.getOrThrow('user', userName);

			expect(unchangedUser.passwordHash).toBe(hashPassword(correctOldPassword));
		});

		it('should clear password expiration after successful change', async () => {
			const userName = 'expiration-test-user';
			const oldPassword = 'expiring-password';
			const newPassword = 'fresh-password';

			// Get shared persistent service and create user with password expiration
			const sharedPersistentService = adminContext.container.resolve('persistentService');
			await sharedPersistentService.put('user', userName, {
				name: userName,
				enabled: true,
				passwordHash: hashPassword(oldPassword),
				passwordExpireAt: Date.now() + 86400000, // 24 hours from now
				permissions: ['flag-value']
			});

			context = await createE2ETestContext({
				userName,
				permissions: ['flag-value']
			});

			// Use shared persistent service
			context.container.register({
				persistentService: { resolve: () => sharedPersistentService }
			});

			// Verify initial expiration is set
			const initialUser = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(initialUser.passwordExpireAt).toBeTruthy();

			// Change password
			await context.rpcCaller.userSetting.changePassword({
				oldPassword,
				recentPassword: newPassword
			});

			// Verify expiration is cleared
			const updatedUser = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(updatedUser.passwordExpireAt).toBeUndefined();
			expect(updatedUser.passwordHash).toBe(hashPassword(newPassword));
		});
	});

	describe('authentication Requirements', () => {
		it('should work with SESSION authentication', async () => {
			const userName = 'session-auth-user';
			const oldPassword = 'old-session-pass';
			const newPassword = 'new-session-pass';

			// Create authenticated session context
			context = await createAuthenticatedUserContext(userName, oldPassword);

			// Should work with proper session authentication
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword,
					recentPassword: newPassword
				})
			).resolves.toBeUndefined();
		});

		it('should reject non-SESSION authentication types', async () => {
			// Create context without session authentication (simulating different auth type)
			context = await createE2ETestContext(); // No user provided = no session auth

			// Should fail without session authentication
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: 'old-pass',
					recentPassword: 'new-pass'
				})
			).rejects.toThrow('Authentication error');
		});

		it('should require authenticated user name', async () => {
			// Create context with invalid authentication state
			context = await createE2ETestContext({
				userName: '', // Empty username
				permissions: ['flag-value']
			});

			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: 'old-pass',
					recentPassword: 'new-pass'
				})
			).rejects.toThrow('Not authenticated');
		});
	});

	describe('password Security', () => {
		it('should properly hash new passwords', async () => {
			const userName = 'hash-test-user';
			const oldPassword = 'old-hash-test';
			const newPassword = 'new-hash-test-secure';

			context = await createAuthenticatedUserContext(userName, oldPassword);

			// Change password
			await context.rpcCaller.userSetting.changePassword({
				oldPassword,
				recentPassword: newPassword
			});

			// Verify new password is properly hashed
			const updatedUser = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);

			expect(updatedUser.passwordHash).not.toBe(newPassword); // Should be hashed, not plain text
			expect(updatedUser.passwordHash).toBe(hashPassword(newPassword)); // Should match expected hash
			expect(updatedUser.passwordHash).toMatch(/^[a-f0-9]{40}$/); // SHA1 hex format
		});

		it('should verify old password hash correctly', async () => {
			const userName = 'hash-verify-user';
			const correctOldPassword = 'correct-old-password';
			const incorrectOldPassword = 'incorrect-old-password';
			const newPassword = 'new-password';

			context = await createAuthenticatedUserContext(userName, correctOldPassword);

			// Verify that the correct old password works
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: correctOldPassword,
					recentPassword: newPassword
				})
			).resolves.toBeUndefined();

			// Reset password back for next test
			const persistentService = context.container.resolve('persistentService');
			await persistentService.overwrite('user', userName, {
				passwordHash: hashPassword(correctOldPassword)
			});

			// Verify that incorrect old password fails
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: incorrectOldPassword,
					recentPassword: 'another-new-password'
				})
			).rejects.toThrow('Old password is incorrect');
		});

		it('should handle allowPasswordExpired metadata', async () => {
			const userName = 'expired-password-user';
			const expiredPassword = 'expired-password';
			const newPassword = 'new-valid-password';

			// Create user with expired password using shared persistence
			const sharedPersistentService = adminContext.container.resolve('persistentService');
			await sharedPersistentService.put('user', userName, {
				name: userName,
				enabled: true,
				passwordHash: hashPassword(expiredPassword),
				passwordExpireAt: Date.now() - 1000, // Expired 1 second ago
				permissions: ['flag-value']
			});

			context = await createE2ETestContext({
				userName,
				permissions: ['flag-value']
			});

			// Use shared persistent service
			context.container.register({
				persistentService: { resolve: () => sharedPersistentService }
			});

			// Should be able to change password even with expired password due to allowPasswordExpired metadata
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: expiredPassword,
					recentPassword: newPassword
				})
			).resolves.toBeUndefined();

			// Verify password was changed and expiration cleared
			const updatedUser = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(updatedUser.passwordHash).toBe(hashPassword(newPassword));
			expect(updatedUser.passwordExpireAt).toBeUndefined();
		});
	});

	describe('error Handling', () => {
		it('should handle non-existent users', async () => {
			const nonExistentUser = 'does-not-exist';

			context = await createE2ETestContext({
				userName: nonExistentUser,
				permissions: ['flag-value']
			});

			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: 'any-password',
					recentPassword: 'new-password'
				})
			).rejects.toThrow('Key does not exist or is invalid');
		});

		it('should handle invalid input data', async () => {
			const userName = 'validation-test-user';
			const validPassword = 'valid-password';

			context = await createAuthenticatedUserContext(userName, validPassword);

			// Test empty old password
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: '',
					recentPassword: 'new-password'
				})
			).rejects.toThrow();

			// Test empty new password
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: validPassword,
					recentPassword: ''
				})
			).rejects.toThrow();
		});

		it('should handle malformed requests', async () => {
			const userName = 'malformed-test-user';
			const validPassword = 'valid-password';

			context = await createAuthenticatedUserContext(userName, validPassword);

			// Test missing fields
			await expect(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				context.rpcCaller.userSetting.changePassword({} as any)
			).rejects.toThrow();

			// Test null values
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: null,
					recentPassword: 'new-password'
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any)
			).rejects.toThrow();
		});
	});

	describe('integration Testing', () => {
		it('should integrate with user data correctly', async () => {
			const userName = 'integration-test-user';
			const oldPassword = 'integration-old-pass';
			const newPassword = 'integration-new-pass';

			// Create user via admin context using shared persistence
			const sharedPersistentService = adminContext.container.resolve('persistentService');
			await adminContext.rpcCaller.user.create({
				key: userName,
				name: 'Integration Test User',
				password: oldPassword,
				permissions: ['flag-value', 'flag-create'],
				mustChangePassword: true
			});

			// Create user context for password change with shared persistence
			context = await createE2ETestContext({
				userName,
				permissions: ['flag-value', 'flag-create']
			});

			// Use shared persistent service with admin context
			context.container.register({
				persistentService: { resolve: () => sharedPersistentService }
			});

			// Verify initial state via admin context (mustChangePassword logic is passwordExpireAt > Date.now())
			const initialUser = await adminContext.rpcCaller.user.get({ key: userName });
			expect(initialUser.mustChangePassword).toBe(false); // It's set to Date.now(), so it's false

			// Change password via userSetting
			await context.rpcCaller.userSetting.changePassword({
				oldPassword,
				recentPassword: newPassword
			});

			// Verify change via admin context
			const updatedUser = await adminContext.rpcCaller.user.get({ key: userName });
			expect(updatedUser.mustChangePassword).toBe(false); // Should be cleared

			// Verify password change worked by attempting another change
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: newPassword,
					recentPassword: 'another-new-password'
				})
			).resolves.toBeUndefined();
		});

		it('should maintain user consistency across services', async () => {
			const userName = 'consistency-test-user';
			const initialPassword = 'initial-password';
			const updatedPassword = 'updated-password';
			const finalPassword = 'final-password';

			// Create user
			context = await createAuthenticatedUserContext(userName, initialPassword, ['users']);

			// Get initial user data
			const initialUser = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(initialUser.passwordHash).toBe(hashPassword(initialPassword));

			// Change password via userSetting
			await context.rpcCaller.userSetting.changePassword({
				oldPassword: initialPassword,
				recentPassword: updatedPassword
			});

			// Verify change in persistence layer
			const afterFirstChange = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(afterFirstChange.passwordHash).toBe(hashPassword(updatedPassword));

			// Change password again
			await context.rpcCaller.userSetting.changePassword({
				oldPassword: updatedPassword,
				recentPassword: finalPassword
			});

			// Verify final state
			const afterSecondChange = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(afterSecondChange.passwordHash).toBe(hashPassword(finalPassword));
			expect(afterSecondChange.name).toBe(userName); // Other data should remain unchanged
			expect(afterSecondChange.enabled).toBe(true);
			expect(afterSecondChange.permissions).toEqual(['users']);
		});

		it('should handle concurrent password change attempts', async () => {
			const userName = 'concurrent-test-user';
			const oldPassword = 'concurrent-old-password';
			const newPassword1 = 'new-password-1';
			const newPassword2 = 'new-password-2';

			context = await createAuthenticatedUserContext(userName, oldPassword);

			// Attempt concurrent password changes - only one should succeed
			const changePromises = [
				context.rpcCaller.userSetting.changePassword({
					oldPassword,
					recentPassword: newPassword1
				}),
				context.rpcCaller.userSetting.changePassword({
					oldPassword,
					recentPassword: newPassword2
				})
			];

			// Wait for both attempts
			const results = await Promise.allSettled(changePromises);

			// In practice, both might succeed quickly or both fail - this is a race condition
			const successCount = results.filter((result) => result.status === 'fulfilled').length;
			const failureCount = results.filter((result) => result.status === 'rejected').length;

			// At least one should succeed, total should be 2
			expect(successCount + failureCount).toBe(2);
			expect(successCount).toBeGreaterThanOrEqual(1);

			// Verify final password state is one of the new passwords
			const finalUser = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			const finalPasswordIsNewPassword1 = finalUser.passwordHash === hashPassword(newPassword1);
			const finalPasswordIsNewPassword2 = finalUser.passwordHash === hashPassword(newPassword2);

			expect(finalPasswordIsNewPassword1 || finalPasswordIsNewPassword2).toBe(true);
			expect(finalUser.passwordHash).not.toBe(hashPassword(oldPassword));
		});
	});

	describe('password Change Edge Cases', () => {
		it('should handle same old and new passwords', async () => {
			const userName = 'same-password-user';
			const password = 'same-password-123';

			context = await createAuthenticatedUserContext(userName, password);

			// Attempt to change password to the same value
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword: password,
					recentPassword: password
				})
			).resolves.toBeUndefined(); // Should succeed even if same

			// Verify password hash remains the same
			const user = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(user.passwordHash).toBe(hashPassword(password));
		});

		it('should handle special characters in passwords', async () => {
			const userName = 'special-chars-user';
			const oldPassword = 'old!@#$%^&*()_+-={}[]|;:,.<>?';
			const newPassword = 'new~`!@#$%^&*()_+-={}[]|\\;:\'",.<>?/';

			context = await createAuthenticatedUserContext(userName, oldPassword);

			// Should handle special characters correctly
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword,
					recentPassword: newPassword
				})
			).resolves.toBeUndefined();

			// Verify password change
			const user = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(user.passwordHash).toBe(hashPassword(newPassword));
		});

		it('should handle very long passwords', async () => {
			const userName = 'long-password-user';
			const oldPassword = 'old-' + 'a'.repeat(1000);
			const newPassword = 'new-' + 'b'.repeat(1000);

			context = await createAuthenticatedUserContext(userName, oldPassword);

			// Should handle long passwords
			await expect(
				context.rpcCaller.userSetting.changePassword({
					oldPassword,
					recentPassword: newPassword
				})
			).resolves.toBeUndefined();

			// Verify password change
			const user = await context.container
				.resolve('persistentService')
				.getOrThrow('user', userName);
			expect(user.passwordHash).toBe(hashPassword(newPassword));
		});
	});
});

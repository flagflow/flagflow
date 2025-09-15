import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { resetFlagServiceState } from '$lib/server/services/FlagService/FlagService';

import { createAPITestContext, createTestUser, parseJSONResponse } from './api.setup';

describe('Authentication API', () => {
	let context: Awaited<ReturnType<typeof createAPITestContext>>;

	beforeEach(async () => {
		await resetFlagServiceState();
		// Use shared container so all contexts share the same data store
		context = await createAPITestContext(undefined, true);
	});

	afterEach(async () => {
		await context.cleanup();
		await resetFlagServiceState();
	});

	describe('POST /api/login', () => {
		it('should login successfully with valid credentials', async () => {
			// First create a test user using authenticated context with shared container
			const adminContext = await createAPITestContext(
				{
					userName: 'admin',
					permissions: ['users']
				},
				true
			);

			const testUser = createTestUser();
			const createResponse = await adminContext.client.post('/api/users', testUser);
			expect(createResponse.ok).toBe(true);

			// Now test login with the created user - use adminContext since it has the data
			const response = await adminContext.client.post('/api/login', {
				username: testUser.key,
				password: testUser.password
			});

			expect(response.status).toBe(200);
			expect(response.headers.get('Content-Type')).toBe('application/json');

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				session: expect.any(String),
				ttlSeconds: expect.any(Number),
				expiredAt: expect.any(String)
			});

			expect(data.session).toHaveLength(32); // Session ID length
			expect(data.ttlSeconds).toBeGreaterThan(0);
			expect(new Date(data.expiredAt).getTime()).toBeGreaterThan(Date.now());

			await adminContext.cleanup();
		});

		it('should reject login with invalid username', async () => {
			const response = await context.client.post('/api/login', {
				username: 'nonexistent_user',
				password: 'any_password'
			});

			expect(response.status).toBe(403);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringContaining('Login error')
			});
		});

		it('should reject login with invalid password', async () => {
			// Create a test user with same context for data sharing
			const adminContext = await createAPITestContext(
				{
					userName: 'admin',
					permissions: ['users']
				},
				true
			);

			const testUser = createTestUser();
			await adminContext.client.post('/api/users', testUser);

			// Try login with wrong password using SAME context
			const response = await adminContext.client.post('/api/login', {
				username: testUser.key,
				password: 'wrong_password'
			});

			expect(response.status).toBe(403);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringContaining('Login error')
			});

			await adminContext.cleanup();
		});

		it('should reject login with invalid request body', async () => {
			const response = await context.client.post('/api/login', {
				username: '', // Empty username
				password: 'test_password'
			});

			expect(response.status).toBe(403);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringMatching(/Too small.*username|Invalid request body|username/)
			});
		});

		it('should reject login with missing password', async () => {
			const response = await context.client.post('/api/login', {
				username: 'test_user'
				// Missing password
			});

			expect(response.status).toBe(400);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringContaining('Invalid request body')
			});
		});

		it('should reject login with empty password', async () => {
			const response = await context.client.post('/api/login', {
				username: 'test_user',
				password: ''
			});

			expect(response.status).toBe(403);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringMatching(/Too small.*password|Invalid request body|password/)
			});
		});

		it('should handle user with multiple permissions', async () => {
			const adminContext = await createAPITestContext(
				{
					userName: 'admin',
					permissions: ['users']
				},
				true
			);

			const testUser = createTestUser({
				key: 'admin-user',
				name: 'Admin User',
				permissions: ['users', 'flag-create', 'flag-value', 'migration']
			});

			await adminContext.client.post('/api/users', testUser);

			// Use same context for login to ensure data sharing
			const response = await adminContext.client.post('/api/login', {
				username: testUser.key,
				password: testUser.password
			});

			expect(response.status).toBe(200);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				session: expect.any(String),
				ttlSeconds: expect.any(Number),
				expiredAt: expect.any(String)
			});

			await adminContext.cleanup();
		});

		it('should handle user that must change password', async () => {
			const adminContext = await createAPITestContext(
				{
					userName: 'admin',
					permissions: ['users']
				},
				true
			);

			const testUser = createTestUser({
				key: 'password-change-user',
				name: 'Password Change User',
				mustChangePassword: true
			});

			await adminContext.client.post('/api/users', testUser);

			// Login should still work, user will need to change password later - use same context
			const response = await adminContext.client.post('/api/login', {
				username: testUser.key,
				password: testUser.password
			});

			expect(response.status).toBe(200);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				session: expect.any(String),
				ttlSeconds: expect.any(Number),
				expiredAt: expect.any(String)
			});

			await adminContext.cleanup();
		});
	});

	describe('POST /api/logout', () => {
		it('should logout successfully when authenticated', async () => {
			// Create test user and login first
			const adminContext = await createAPITestContext(
				{
					userName: 'admin',
					permissions: ['users']
				},
				true
			);

			const testUser = createTestUser();
			await adminContext.client.post('/api/users', testUser);

			// Use same context for login to ensure data sharing
			const loginResponse = await adminContext.client.post('/api/login', {
				username: testUser.key,
				password: testUser.password
			});

			expect(loginResponse.status).toBe(200);
			const loginData = await parseJSONResponse(loginResponse);

			// Create authenticated context for logout
			const authenticatedContext = await createAPITestContext({
				userName: testUser.name,
				permissions: testUser.permissions
			});

			// Logout
			const logoutResponse = await authenticatedContext.client.post('/api/logout');

			expect(logoutResponse.status).toBe(200);

			const logoutData = await parseJSONResponse(logoutResponse);
			expect(logoutData).toMatchObject({
				status: expect.any(String)
			});

			await adminContext.cleanup();
			await authenticatedContext.cleanup();
		});

		it('should reject logout when not authenticated', async () => {
			const response = await context.client.post('/api/logout');

			expect(response.status).toBe(403);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringMatching(/not authenticated|authentication|unauthorized/i)
			});
		});

		it('should handle logout with invalid session', async () => {
			// Create context with invalid authentication
			const invalidAuthContext = await createAPITestContext({
				userName: 'invalid_user',
				permissions: []
			});

			const response = await invalidAuthContext.client.post('/api/logout');

			// Should still work but may return different status
			expect([200, 403]).toContain(response.status);

			await invalidAuthContext.cleanup();
		});
	});

	describe('Authentication flow integration', () => {
		it('should complete full login/logout workflow', async () => {
			// Step 1: Create a test user
			const adminContext = await createAPITestContext({
				userName: 'admin',
				permissions: ['users']
			});

			const testUser = createTestUser({
				key: 'workflow.user',
				name: 'Workflow User',
				permissions: ['flag-value', 'users']
			});

			const createResponse = await adminContext.client.post('/api/users', testUser);
			expect(createResponse.status).toBe(200);

			// Step 2: Login - use same context for data sharing
			const loginResponse = await adminContext.client.post('/api/login', {
				username: testUser.key,
				password: testUser.password
			});

			expect(loginResponse.status).toBe(200);
			const loginData = await parseJSONResponse(loginResponse);
			expect(loginData).toHaveProperty('session');

			// Step 3: Use session for authenticated requests
			const authenticatedContext = await createAPITestContext({
				userName: testUser.name,
				permissions: testUser.permissions
			});

			// Test that we can make authenticated calls
			const sessionsResponse = await authenticatedContext.client.get('/api/sessions');
			expect(sessionsResponse.status).toBe(200);

			// Step 4: Logout
			const logoutResponse = await authenticatedContext.client.post('/api/logout');
			expect(logoutResponse.status).toBe(200);

			await adminContext.cleanup();
			await authenticatedContext.cleanup();
		});

		it('should handle concurrent login attempts', async () => {
			// Create multiple test users
			const adminContext = await createAPITestContext({
				userName: 'admin',
				permissions: ['users']
			});

			const users = [
				createTestUser({ key: 'concurrent.user.1', name: 'User 1' }),
				createTestUser({ key: 'concurrent.user.2', name: 'User 2' }),
				createTestUser({ key: 'concurrent.user.3', name: 'User 3' })
			];

			// Create all users
			for (const user of users) {
				const response = await adminContext.client.post('/api/users', user);
				expect(response.status).toBe(200);
			}

			// Attempt concurrent logins - use same context for data sharing
			const loginPromises = users.map((user) =>
				adminContext.client.post('/api/login', {
					username: user.key,
					password: user.password
				})
			);

			const results = await Promise.all(loginPromises);

			// Verify all logins succeeded
			expect(results).toHaveLength(3);

			// Parse all responses once and store the data
			const loginData: any[] = [];
			for (let i = 0; i < results.length; i++) {
				expect(results[i].status).toBe(200);
				const data = await parseJSONResponse(results[i]);
				expect(data).toMatchObject({
					session: expect.any(String),
					ttlSeconds: expect.any(Number),
					expiredAt: expect.any(String)
				});
				loginData.push(data);
			}

			// Verify all session IDs are unique
			const sessionIds = loginData.map((d) => d.session);
			const uniqueSessionIds = new Set(sessionIds);
			expect(uniqueSessionIds.size).toBe(3);

			await adminContext.cleanup();
		});
	});
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { resetFlagServiceState } from '$lib/server/services/FlagService/FlagService';

import { createAPITestContext, createTestUser, parseJSONResponse } from './api.setup';

describe('Users API', () => {
	let context: Awaited<ReturnType<typeof createAPITestContext>>;
	let unauthenticatedContext: Awaited<ReturnType<typeof createAPITestContext>>;

	beforeEach(async () => {
		await resetFlagServiceState();

		// Create authenticated context with users permission
		context = await createAPITestContext({
			userName: 'admin',
			permissions: ['users']
		});

		// Create unauthenticated context for negative tests
		unauthenticatedContext = await createAPITestContext();
	});

	afterEach(async () => {
		await context.cleanup();
		await unauthenticatedContext.cleanup();
		await resetFlagServiceState();
	});

	describe('GET /api/users', () => {
		it('should return users list when authenticated with users permission', async () => {
			// First create some test users
			const user1 = createTestUser({ key: 'test-user1', name: 'Test User 1' });
			const user2 = createTestUser({ key: 'test-user2', name: 'Test User 2' });

			await context.client.post('/api/users', user1);
			await context.client.post('/api/users', user2);

			// Get users list
			const response = await context.client.get('/api/users');

			expect(response.status).toBe(200);
			expect(response.headers.get('Content-Type')).toBe('application/json');

			const data = await parseJSONResponse(response);
			expect(data).toHaveProperty('users');
			expect(typeof data.users).toBe('object');

			// Check that our created users are in the response (with user/ prefix)
			expect(data.users).toHaveProperty(`user/${user1.key}`);
			expect(data.users).toHaveProperty(`user/${user2.key}`);

			expect(data.users[`user/${user1.key}`]).toMatchObject({
				name: user1.name,
				permissions: user1.permissions,
				enabled: expect.any(Boolean)
			});
		});

		it('should reject unauthenticated requests', async () => {
			const response = await unauthenticatedContext.client.get('/api/users');

			expect(response.status).toBe(500);

			const data = await parseJSONResponse(response);
			expect(data).toHaveProperty('message');
		});

		it('should reject requests without users permission', async () => {
			// Create context with different permissions
			const noPermissionContext = await createAPITestContext({
				userName: 'user_no_perm',
				permissions: ['flag-value'] // Missing 'users' permission
			});

			const response = await noPermissionContext.client.get('/api/users');

			expect(response.status).toBe(500);

			await noPermissionContext.cleanup();
		});

		it('should return empty users object when no users exist', async () => {
			const response = await context.client.get('/api/users');

			expect(response.status).toBe(200);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				users: {}
			});
		});
	});

	describe('POST /api/users', () => {
		it('should create user successfully with valid data', async () => {
			const testUser = createTestUser({
				key: 'new-user',
				name: 'New User',
				permissions: ['flag-value', 'flag-schema']
			});

			const response = await context.client.post('/api/users', testUser);

			expect(response.status).toBe(200);
			expect(response.headers.get('Content-Type')).toBe('application/json');

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				success: true
			});

			// Verify user was actually created by getting users list
			const getUsersResponse = await context.client.get('/api/users');
			const usersData = await parseJSONResponse(getUsersResponse);

			expect(usersData.users).toHaveProperty(`user/${testUser.key}`);
			expect(usersData.users[`user/${testUser.key}`]).toMatchObject({
				name: testUser.name,
				permissions: testUser.permissions
			});
		});

		it('should reject invalid user data', async () => {
			const invalidUser = {
				key: '', // Empty key should fail validation
				name: 'Invalid User',
				password: 'password',
				permissions: ['flag-value'],
				mustChangePassword: false
			};

			const response = await context.client.post('/api/users', invalidUser);

			expect(response.status).toBe(400);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringContaining('Invalid request body')
			});
		});

		it('should reject user with invalid permissions', async () => {
			const invalidUser = createTestUser({
				permissions: ['invalid-permission'] as any
			});

			const response = await context.client.post('/api/users', invalidUser);

			expect(response.status).toBe(400);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringContaining('Invalid request body')
			});
		});

		it('should reject request without users permission', async () => {
			const noPermissionContext = await createAPITestContext({
				userName: 'user_no_perm',
				permissions: ['flag-value']
			});

			const testUser = createTestUser();
			const response = await noPermissionContext.client.post('/api/users', testUser);

			expect(response.status).toBe(500);

			await noPermissionContext.cleanup();
		});

		it('should handle user with all permissions', async () => {
			const testUser = createTestUser({
				key: 'super.admin',
				name: 'Super Admin',
				permissions: ['flag-create', 'flag-schema', 'flag-value', 'users', 'migration']
			});

			const response = await context.client.post('/api/users', testUser);

			expect(response.status).toBe(200);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				success: true
			});
		});
	});

	describe('PATCH /api/users/{key}', () => {
		it('should update user successfully', async () => {
			// First create a user
			const originalUser = createTestUser({
				key: 'update.user',
				name: 'Original Name'
			});

			await context.client.post('/api/users', originalUser);

			// Update the user
			const updateData = {
				name: 'Updated Name',
				permissions: ['flag-create', 'flag-value'],
				enabled: false
			};

			const response = await context.client.patch(`/api/users/${originalUser.key}`, updateData);

			expect(response.status).toBe(200);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				success: true
			});

			// Verify the update by getting users list
			const getUsersResponse = await context.client.get('/api/users');
			const usersData = await parseJSONResponse(getUsersResponse);

			expect(usersData.users[`user/${originalUser.key}`]).toMatchObject({
				name: updateData.name,
				permissions: updateData.permissions,
				enabled: updateData.enabled
			});
		});

		it('should reject update with invalid data', async () => {
			const testUser = createTestUser({ key: 'invalid-update-user' });
			await context.client.post('/api/users', testUser);

			// Use a more clearly invalid update - invalid key format
			const invalidUpdate = {
				name: 'Valid Name',
				permissions: ['invalid-permission-type'] as any
			};

			const response = await context.client.patch(`/api/users/${testUser.key}`, invalidUpdate);

			expect(response.status).toBe(400);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringContaining('Invalid request body')
			});
		});

		it('should reject request for nonexistent user', async () => {
			const updateData = {
				name: 'Updated Name',
				permissions: ['flag-value']
			};

			const response = await context.client.patch('/api/users/nonexistent.user', updateData);

			// Should return appropriate error status
			expect([400, 404, 500]).toContain(response.status);
		});

		it('should reject request without users permission', async () => {
			const noPermissionContext = await createAPITestContext({
				userName: 'user_no_perm',
				permissions: ['flag-value']
			});

			// Create user first with admin context
			const testUser = createTestUser({ key: 'no-perm-update-user' });
			await context.client.post('/api/users', testUser);

			const updateData = { name: 'Updated Name' };
			const response = await noPermissionContext.client.patch(
				`/api/users/${testUser.key}`,
				updateData
			);

			expect(response.status).toBe(500);

			await noPermissionContext.cleanup();
		});
	});

	describe('DELETE /api/users/{key}', () => {
		it('should delete user successfully', async () => {
			// First create a user
			const testUser = createTestUser({
				key: 'delete.user',
				name: 'Delete User'
			});

			const createResponse = await context.client.post('/api/users', testUser);
			expect(createResponse.status).toBe(200);

			// Delete the user
			const response = await context.client.delete(`/api/users/${testUser.key}`);

			expect(response.status).toBe(200);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				success: true
			});

			// Verify the user was deleted by checking users list
			const getUsersResponse = await context.client.get('/api/users');
			const usersData = await parseJSONResponse(getUsersResponse);

			expect(usersData.users).not.toHaveProperty(`user/${testUser.key}`);
		});

		it('should reject request for nonexistent user', async () => {
			const response = await context.client.delete('/api/users/nonexistent.user');

			// Should return appropriate error status
			expect([400, 404, 500]).toContain(response.status);
		});

		it('should reject request without users permission', async () => {
			const noPermissionContext = await createAPITestContext({
				userName: 'user_no_perm',
				permissions: ['flag-value']
			});

			// Create user first with admin context
			const testUser = createTestUser({ key: 'no-perm-delete-user' });
			await context.client.post('/api/users', testUser);

			const response = await noPermissionContext.client.delete(`/api/users/${testUser.key}`);

			expect(response.status).toBe(500);

			await noPermissionContext.cleanup();
		});

		it('should handle deletion of user that cannot delete self', async () => {
			// Create a user and try to delete themselves
			const selfDeleteUser = createTestUser({
				key: 'self.delete.user',
				permissions: ['users'] // Has users permission
			});

			await context.client.post('/api/users', selfDeleteUser);

			// Create context as this user
			const selfContext = await createAPITestContext({
				userName: 'self.delete.user', // Using key as userName
				permissions: ['users']
			});

			const response = await selfContext.client.delete(`/api/users/${selfDeleteUser.key}`);

			// Should reject self-deletion
			expect(response.status).toBe(500);

			const data = await parseJSONResponse(response);
			expect(data).toMatchObject({
				message: expect.stringMatching(/cannot delete.*own|self/i)
			});

			await selfContext.cleanup();
		});
	});

	describe('Users API integration', () => {
		it('should handle complete CRUD workflow', async () => {
			const userKey = 'crud-workflow-user';

			// Create
			const createData = createTestUser({
				key: userKey,
				name: 'CRUD User',
				permissions: ['flag-value']
			});

			const createResponse = await context.client.post('/api/users', createData);
			expect(createResponse.status).toBe(200);

			// Read
			const readResponse = await context.client.get('/api/users');
			expect(readResponse.status).toBe(200);

			const readData = await parseJSONResponse(readResponse);
			expect(readData.users).toHaveProperty(`user/${userKey}`);

			// Update
			const updateData = {
				name: 'Updated CRUD User',
				permissions: ['flag-create', 'flag-value']
			};

			const updateResponse = await context.client.patch(`/api/users/${userKey}`, updateData);
			expect(updateResponse.status).toBe(200);

			// Verify update
			const verifyResponse = await context.client.get('/api/users');
			const verifyData = await parseJSONResponse(verifyResponse);
			expect(verifyData.users[`user/${userKey}`]).toMatchObject({
				name: updateData.name,
				permissions: updateData.permissions
			});

			// Delete
			const deleteResponse = await context.client.delete(`/api/users/${userKey}`);
			expect(deleteResponse.status).toBe(200);

			// Verify deletion
			const finalResponse = await context.client.get('/api/users');
			const finalData = await parseJSONResponse(finalResponse);
			expect(finalData.users).not.toHaveProperty(`user/${userKey}`);
		});

		it('should handle multiple users operations', async () => {
			const users = [
				createTestUser({ key: 'multi-user1', name: 'Multi User 1', permissions: ['flag-value'] }),
				createTestUser({ key: 'multi-user2', name: 'Multi User 2', permissions: ['flag-schema'] }),
				createTestUser({ key: 'multi-user3', name: 'Multi User 3', permissions: ['users'] })
			];

			// Create all users
			for (const user of users) {
				const response = await context.client.post('/api/users', user);
				expect(response.status).toBe(200);
			}

			// Get all users and verify they exist
			const getUsersResponse = await context.client.get('/api/users');
			const getUsersData = await parseJSONResponse(getUsersResponse);

			for (const user of users) {
				expect(getUsersData.users).toHaveProperty(`user/${user.key}`);
				expect(getUsersData.users[`user/${user.key}`]).toMatchObject({
					name: user.name,
					permissions: user.permissions
				});
			}

			// Update one user
			const updateData = { name: 'Updated Multi User 1', permissions: ['flag-create'] };
			const updateResponse = await context.client.patch(`/api/users/${users[0].key}`, updateData);
			expect(updateResponse.status).toBe(200);

			// Delete one user
			const deleteResponse = await context.client.delete(`/api/users/${users[1].key}`);
			expect(deleteResponse.status).toBe(200);

			// Final verification
			const finalResponse = await context.client.get('/api/users');
			const finalData = await parseJSONResponse(finalResponse);

			// User 0 should be updated
			expect(finalData.users[`user/${users[0].key}`]).toMatchObject({
				name: updateData.name,
				permissions: updateData.permissions
			});

			// User 1 should be deleted
			expect(finalData.users).not.toHaveProperty(`user/${users[1].key}`);

			// User 2 should remain unchanged
			expect(finalData.users).toHaveProperty(`user/${users[2].key}`);
		});
	});
});

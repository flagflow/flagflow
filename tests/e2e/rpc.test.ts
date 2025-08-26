/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable vitest/no-hooks, vitest/prefer-expect-assertions */
// @ts-nocheck
import { asValue } from 'awilix';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetFlagServiceState } from '$lib/server/services/FlagService/FlagService';

import type { E2ETestContext } from './setup';
import { createE2ETestContext, createTestFlag } from './setup';

describe('rPC E2E Tests', () => {
	let context: E2ETestContext;

	beforeEach(async () => {
		// Reset FlagService module-level state before each test
		await resetFlagServiceState();

		// Create context with a test user having all permissions
		context = await createE2ETestContext({
			userName: 'test-user',
			permissions: ['flag-create', 'flag-schema', 'flag-value', 'users', 'migration']
		});
	});

	afterEach(async () => {
		await context.cleanup();
		// Reset again after each test to ensure clean state
		await resetFlagServiceState();
	});

	describe('flag CRUD Operations', () => {
		it('should create, read, update, and delete a flag', async () => {
			const flagKey = 'test/boolean_flag';
			const flagData = createTestFlag({
				description: 'A boolean flag for testing',
				type: 'BOOLEAN',
				defaultValue: false,
				value: true,
				valueExists: true,
				isKillSwitch: false
			});

			// Create flag
			await expect(
				context.rpcCaller.flag.create({
					key: flagKey,
					flag: flagData
				})
			).resolves.toBeUndefined();

			// Read flag
			const createdFlag = await context.rpcCaller.flag.get({ key: flagKey });

			expect(createdFlag).toMatchObject({
				key: flagKey,
				...flagData
			});

			// Update flag value
			const updatedFlagData = { ...flagData, value: false, valueExists: true };

			await expect(
				context.rpcCaller.flag.updateValue({
					key: flagKey,
					flag: updatedFlagData
				})
			).resolves.toBeUndefined();

			// Verify update
			const updatedFlag = await context.rpcCaller.flag.get({ key: flagKey });

			expect(updatedFlag.value).toBe(false);
			expect(updatedFlag.valueExists).toBe(true);

			// List flags - should contain our flag
			const flagsList = await context.rpcCaller.flag.getList();

			expect(flagsList).toContainEqual(
				expect.objectContaining({
					key: `flag/${flagKey}`,
					type: 'BOOLEAN'
				})
			);

			// Delete flag
			await expect(context.rpcCaller.flag.delete({ key: flagKey })).resolves.toBeUndefined();

			// Verify deletion - should throw
			await expect(context.rpcCaller.flag.get({ key: flagKey })).rejects.toThrow(
				'Key not exists or invalid'
			);
		});

		it('should handle different flag types', async () => {
			const testFlags = [
				{
					key: 'test/integer_flag',
					flag: createTestFlag({
						type: 'INTEGER',
						defaultValue: 10,
						minValue: 0,
						maxValue: 100,
						value: 25,
						valueExists: true
					})
				},
				{
					key: 'test/string_flag',
					flag: createTestFlag({
						type: 'STRING',
						defaultValue: 'default',
						maxLength: 50,
						regExp: '^[a-zA-Z0-9]+$',
						value: 'testvalue',
						valueExists: true
					})
				},
				{
					key: 'test/enum_flag',
					flag: createTestFlag({
						type: 'ENUM',
						defaultValue: 'option1',
						enumValues: ['option1', 'option2', 'option3'],
						allowEmpty: false,
						value: 'option2',
						valueExists: true
					})
				}
			];

			// Create all flags
			for (const { key, flag } of testFlags) {
				await context.rpcCaller.flag.create({ key, flag });
			}

			// Verify all flags exist and have correct types
			const flagsList = await context.rpcCaller.flag.getList();
			for (const { key, flag } of testFlags) {
				const foundFlag = flagsList.find((f) => f.key === `flag/${key}`);

				expect(foundFlag).toBeTruthy();
				expect(foundFlag?.type).toBe(flag.type);
			}
		});
	});

	describe('global Flag Operations', () => {
		it('should rename/move flags across groups', async () => {
			const originalKey = 'group1/feature_flag';
			const renamedKey = 'group2/renamed_feature_flag';
			const flagData = createTestFlag({
				description: 'A flag to be renamed',
				type: 'BOOLEAN',
				defaultValue: false,
				value: true,
				valueExists: true
			});

			// Create original flag
			await context.rpcCaller.flag.create({
				key: originalKey,
				flag: flagData
			});

			// Rename flag
			await expect(
				context.rpcCaller.flag.rename({
					oldKey: originalKey,
					recentKey: renamedKey,
					description: flagData.description
				})
			).resolves.toBeUndefined();

			// Verify original key no longer exists
			await expect(context.rpcCaller.flag.get({ key: originalKey })).rejects.toThrow(
				'Key not exists or invalid'
			);

			// Verify renamed key exists with same data
			const renamedFlag = await context.rpcCaller.flag.get({ key: renamedKey });

			expect(renamedFlag).toMatchObject({
				key: renamedKey,
				...flagData
			});
		});

		it('should handle schema updates', async () => {
			const flagKey = 'test/schema_update_flag';
			const originalFlag = createTestFlag({
				description: 'Original description',
				type: 'INTEGER',
				defaultValue: 10,
				minValue: 0,
				maxValue: 50,
				value: 25,
				valueExists: true
			});

			// Create flag
			await context.rpcCaller.flag.create({
				key: flagKey,
				flag: originalFlag
			});

			// Update schema
			const modifiedSchema = {
				...originalFlag,
				description: 'Updated description',
				minValue: 5,
				maxValue: 100
			};

			await expect(
				context.rpcCaller.flag.updateSchema({
					key: flagKey,
					flag: modifiedSchema,
					resetValue: false
				})
			).resolves.toBeUndefined();

			// Verify schema update
			const updatedFlag = await context.rpcCaller.flag.get({ key: flagKey });

			expect(updatedFlag.description).toBe('Original description'); // Description should not change in schema update
			expect(updatedFlag.minValue).toBe(5);
			expect(updatedFlag.maxValue).toBe(100);
		});
	});

	describe('export Validations', () => {
		it('should generate TypeScript exports', async () => {
			// Create test flags for export
			await context.rpcCaller.flag.create({
				key: 'export/boolean_flag',
				flag: createTestFlag({
					type: 'BOOLEAN',
					defaultValue: false,
					value: true,
					valueExists: true
				})
			});

			await context.rpcCaller.flag.create({
				key: 'export/integer_flag',
				flag: createTestFlag({
					type: 'INTEGER',
					defaultValue: 10,
					minValue: 0,
					maxValue: 100,
					value: 25,
					valueExists: true
				})
			});

			// Get TypeScript content
			const flagService = context.container.resolve('flagService');
			const tsContent = await flagService.getTSFileContent();

			expect(tsContent).toBeTruthy();
			expect(typeof tsContent).toBe('string');

			// Verify TypeScript content contains our flags
			expect(tsContent).toContain('boolean_flag');
			expect(tsContent).toContain('integer_flag');

			// Basic TypeScript syntax checks
			expect(tsContent).toContain('export type');
			expect(tsContent).toContain('boolean');
			expect(tsContent).toContain('number');
		});

		it('should generate hash exports for groups', async () => {
			// Create flags in the same group
			const groupName = 'hash_test_group';
			await context.rpcCaller.flag.create({
				key: `${groupName}/flag1`,
				flag: createTestFlag({ type: 'BOOLEAN', defaultValue: true })
			});

			await context.rpcCaller.flag.create({
				key: `${groupName}/flag2`,
				flag: createTestFlag({
					type: 'STRING',
					defaultValue: 'test',
					maxLength: 100,
					regExp: '',
					value: 'test',
					valueExists: true
				})
			});

			// Get group hash
			const flagService = context.container.resolve('flagService');
			const fullGroupName = `flag/${groupName}`;
			const groupHash = await flagService.getFlagGroupHash(fullGroupName);

			expect(groupHash).toBeTruthy();
			expect(typeof groupHash).toBe('string');
			expect(groupHash.length).toBeGreaterThan(0);

			// Hash should remain the same for changes that don't affect TypeScript types
			const flagToUpdate = await context.rpcCaller.flag.get({ key: `${groupName}/flag1` });
			const updatedSchema = {
				...flagToUpdate,
				description: 'Modified description for hash test',
				isKillSwitch: !flagToUpdate.isKillSwitch // Change schema property
			};
			await context.rpcCaller.flag.updateSchema({
				key: `${groupName}/flag1`,
				flag: updatedSchema,
				resetValue: false
			});

			const modifiedGroupHash = await flagService.getFlagGroupHash(fullGroupName);

			// Hash should be the same because TypeScript type didn't change
			expect(modifiedGroupHash).toBe(groupHash);
		});

		it('should generate migration backup with snapshots', async () => {
			// Create test data for migration
			await context.rpcCaller.flag.create({
				key: 'migration/test_flag_1',
				flag: createTestFlag({
					type: 'BOOLEAN',
					description: 'First test flag',
					defaultValue: false,
					value: true,
					valueExists: true
				})
			});

			await context.rpcCaller.flag.create({
				key: 'migration/test_flag_2',
				flag: createTestFlag({
					type: 'INTEGER',
					description: 'Second test flag',
					defaultValue: 0,
					minValue: 0,
					maxValue: 100,
					value: 42,
					valueExists: true
				})
			});

			// Generate migration export
			const flagService = context.container.resolve('flagService');
			const migrationData = await flagService.getMigrationFileContent();

			expect(migrationData).toBeTruthy();
			expect(migrationData.environment).toBeTruthy();
			expect(migrationData.createdAt).toBeTruthy();
			expect(migrationData.flags).toBeTruthy();

			// Verify our test flags are included (with flag/ prefix as they are stored internally)
			expect(migrationData.flags).toHaveProperty('flag/migration/test_flag_1');
			expect(migrationData.flags).toHaveProperty('flag/migration/test_flag_2');

			const flag1 = migrationData.flags['flag/migration/test_flag_1'];
			const flag2 = migrationData.flags['flag/migration/test_flag_2'];

			expect(flag1.type).toBe('BOOLEAN');
			expect(flag1.description).toBe('First test flag');
			expect(flag2.type).toBe('INTEGER');
			expect(flag2.description).toBe('Second test flag');
		});
	});

	describe('real-time Updates', () => {
		it('should handle watchers for flag changes', async () => {
			const flagKey = 'watcher_test/flag';
			const events: Array<{ event: string; key: string; value?: string }> = [];

			// Set up watcher
			const persistentService = context.container.resolve('persistentService');
			const watcher = await persistentService.watch('flag', (event, key, value) => {
				events.push({ event, key, value });
			});

			// Create flag - should trigger watcher
			await context.rpcCaller.flag.create({
				key: flagKey,
				flag: createTestFlag()
			});

			// Update flag - should trigger watcher
			const flagToUpdate = await context.rpcCaller.flag.get({ key: flagKey });
			const updatedFlag = { ...flagToUpdate, value: false, valueExists: true };
			await context.rpcCaller.flag.updateValue({
				key: flagKey,
				flag: updatedFlag
			});

			// Delete flag - should trigger watcher
			await context.rpcCaller.flag.delete({ key: flagKey });

			// Clean up watcher
			await watcher.stop();

			// Verify events were triggered
			expect(events.length).toBeGreaterThanOrEqual(3);

			const createEvent = events.find(
				(event) => event.event === 'data' && event.key.includes(flagKey)
			);

			expect(createEvent).toBeTruthy();

			const deleteEvent = events.find(
				(event) => event.event === 'delete' && event.key.includes(flagKey)
			);

			expect(deleteEvent).toBeTruthy();
		});
	});

	describe('permission-based Access Control', () => {
		it('should enforce permissions on flag operations', async () => {
			const flagKey = 'permission_test/flag';

			// Create context with limited permissions (no flag-create) but sharing the same persistent service
			const sharedPersistentService = context.container.resolve('persistentService');
			const limitedContext = await createE2ETestContext({
				userName: 'limited-user',
				permissions: ['flag-value'] // Only value permissions
			});

			// Replace the persistent service in limited context with the shared one
			limitedContext.container.register({
				persistentService: asValue(sharedPersistentService)
			});

			// Should fail to create flag without permission
			await expect(
				limitedContext.rpcCaller.flag.create({
					key: flagKey,
					flag: createTestFlag()
				})
			).rejects.toThrow('Permission error');

			// Create flag with full permissions first
			await context.rpcCaller.flag.create({
				key: flagKey,
				flag: createTestFlag()
			});

			// Limited user should be able to update values
			const flagToUpdate = await context.rpcCaller.flag.get({ key: flagKey });
			const updatedFlag = { ...flagToUpdate, value: false, valueExists: true };

			await expect(
				limitedContext.rpcCaller.flag.updateValue({
					key: flagKey,
					flag: updatedFlag
				})
			).resolves.toBeUndefined();

			// But should not be able to delete
			await expect(limitedContext.rpcCaller.flag.delete({ key: flagKey })).rejects.toThrow(
				'Permission error'
			);

			await limitedContext.cleanup();
		});
	});

	describe('error Handling', () => {
		it('should handle validation errors', async () => {
			const invalidFlag = {
				description: 'Invalid flag',
				type: 'BOOLEAN',
				defaultValue: 'not a boolean', // Invalid type
				value: true,
				valueExists: true,
				isKillSwitch: false
			};

			await expect(
				context.rpcCaller.flag.create({
					key: 'test/invalid_flag',
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					flag: invalidFlag as any
				})
			).rejects.toThrow('Invalid input');
		});

		it('should handle duplicate key errors', async () => {
			const flagKey = 'test/duplicate_flag';
			const flagData = createTestFlag();

			// Create first flag
			await context.rpcCaller.flag.create({
				key: flagKey,
				flag: flagData
			});

			// Attempt to create duplicate - should fail
			await expect(
				context.rpcCaller.flag.create({
					key: flagKey,
					flag: flagData
				})
			).rejects.toThrow('Key already exists');
		});

		it('should handle non-existent key errors', async () => {
			const nonExistentKey = 'test/does_not_exist';

			await expect(context.rpcCaller.flag.get({ key: nonExistentKey })).rejects.toThrow(
				'Key not exists or invalid'
			);

			await expect(
				context.rpcCaller.flag.updateValue({
					key: nonExistentKey,
					flag: createTestFlag({ value: true, valueExists: true })
				})
			).rejects.toThrow('Key not exists');
		});
	});
});

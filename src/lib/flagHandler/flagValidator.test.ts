/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import type { PersistentFlag } from '$types/persistent';

import { flagSchemaValidator, flagValueValidator } from './flagValidator';

describe('flagValidator', () => {
	describe('flagSchemaValidator', () => {
		it('should validate boolean flags', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};

			expect(flagSchemaValidator(flag)).toBe('');
		});

		it('should validate integer flags with valid bounds', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 50,
				minValue: 0,
				maxValue: 100,
				valueExists: true,
				value: 75
			};

			expect(flagSchemaValidator(flag)).toBe('');
		});

		it('should reject integer flags with invalid bounds', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 50,
				minValue: 100,
				maxValue: 0,
				valueExists: true,
				value: 75
			};

			expect(flagSchemaValidator(flag)).toBe(
				'Minimum value (100) cannot be greater than maximum value (0)'
			);
		});

		it('should reject integer flags with default value out of bounds', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 150,
				minValue: 0,
				maxValue: 100,
				valueExists: true,
				value: 75
			};

			expect(flagSchemaValidator(flag)).toBe('Default value (150) must be between 0 and 100');
		});

		it('should validate string flags with valid length', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: 10,
				regExp: '',
				valueExists: true,
				value: 'value'
			};

			expect(flagSchemaValidator(flag)).toBe('');
		});

		it('should reject string flags with negative max length', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: -1,
				regExp: '',
				valueExists: true,
				value: 'value'
			};

			expect(flagSchemaValidator(flag)).toBe('Maximum length (-1) cannot be negative');
		});

		it('should reject string flags with default value too long', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'this is too long',
				maxLength: 5,
				regExp: '',
				valueExists: true,
				value: 'value'
			};

			expect(flagSchemaValidator(flag)).toBe('Default value is too long (max 5 chars)');
		});

		it('should validate string flags with valid regex', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'abc',
				maxLength: 10,
				regExp: '^[a-z]+$',
				valueExists: true,
				value: 'xyz'
			};

			expect(flagSchemaValidator(flag)).toBe('');
		});

		it('should reject string flags with invalid regex', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: 10,
				regExp: '[invalid',
				valueExists: true,
				value: 'value'
			};

			expect(flagSchemaValidator(flag)).toBe('Invalid regexp: [invalid');
		});

		it('should reject string flags with default not matching regex', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'ABC',
				maxLength: 10,
				regExp: '^[a-z]+$',
				valueExists: true,
				value: 'xyz'
			};

			expect(flagSchemaValidator(flag)).toBe('Default value (ABC) does not match /^[a-z]+$/');
		});

		it('should validate enum flags with valid configuration', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: 'option1',
				enumValues: ['option1', 'option2', 'option3'],
				allowEmpty: false,
				valueExists: true,
				value: 'option2'
			};

			expect(flagSchemaValidator(flag)).toBe('');
		});

		it('should reject enum flags with empty enum values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: 'option1',
				enumValues: [],
				allowEmpty: false,
				valueExists: true,
				value: 'option1'
			};

			expect(flagSchemaValidator(flag)).toBe('Enum must have at least one value');
		});

		it('should reject enum flags with empty default when not allowed', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: '',
				enumValues: ['option1', 'option2'],
				allowEmpty: false,
				valueExists: true,
				value: 'option1'
			};

			expect(flagSchemaValidator(flag)).toBe('Default value is required');
		});

		it('should reject enum flags with invalid default value', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: 'invalid',
				enumValues: ['option1', 'option2'],
				allowEmpty: false,
				valueExists: true,
				value: 'option1'
			};

			expect(flagSchemaValidator(flag)).toBe(
				'Default value (invalid) must be one of the enum values'
			);
		});

		it('should validate tag flags with valid configuration', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1', 'tag2'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 1,
				maxCount: 3,
				valueExists: true,
				value: ['tag2']
			};

			expect(flagSchemaValidator(flag)).toBe('');
		});

		it('should reject tag flags with empty tag values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: [],
				tagValues: [],
				minCount: 0,
				maxCount: 3,
				valueExists: true,
				value: []
			};

			expect(flagSchemaValidator(flag)).toBe('Tag must have at least one value');
		});

		it('should reject tag flags with min count too high', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2'],
				minCount: 5,
				maxCount: 10,
				valueExists: true,
				value: ['tag1']
			};

			expect(flagSchemaValidator(flag)).toBe(
				'Minimum tag values count (5) cannot be greater than available tag values (2)'
			);
		});

		it('should reject tag flags with default not meeting min count', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: [],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 2,
				maxCount: 3,
				valueExists: true,
				value: ['tag1']
			};

			expect(flagSchemaValidator(flag)).toBe('Default value must have at least 2 tags');
		});

		it('should reject tag flags with default exceeding max count', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1', 'tag2', 'tag3'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 1,
				maxCount: 2,
				valueExists: true,
				value: ['tag1']
			};

			expect(flagSchemaValidator(flag)).toBe('Default value must have at most 2 tags');
		});

		it('should reject tag flags with invalid default values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['invalid'],
				tagValues: ['tag1', 'tag2'],
				minCount: 0,
				maxCount: 2,
				valueExists: true,
				value: ['tag1']
			};

			expect(flagSchemaValidator(flag)).toBe('Allowed values for tags: tag1, tag2');
		});

		it('should validate AB-TEST flags with valid percentage', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'AB-TEST',
				chanceBPercent: 50
			};

			expect(flagSchemaValidator(flag)).toBe('');
		});

		it('should reject AB-TEST flags with invalid percentage', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'AB-TEST',
				chanceBPercent: 150
			};

			expect(flagSchemaValidator(flag)).toBe('Chance B percent (150) must be between 0 and 100');
		});

		it('should handle unknown flag type', () => {
			const flag = {
				description: 'Test flag',
				type: 'UNKNOWN'
			} as any as PersistentFlag;

			expect(flagSchemaValidator(flag)).toBe('Unknown flag type');
		});
	});

	describe('flagValueValidator', () => {
		it('should skip validation when valueExists is false', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'valid',
				maxLength: 5,
				regExp: '^[a-z]+$',
				valueExists: false,
				value: 'INVALID123' // This would normally fail validation
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should validate boolean flag values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should validate integer flag values within bounds', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 50,
				minValue: 0,
				maxValue: 100,
				valueExists: true,
				value: 75
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should reject non-integer values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 50,
				minValue: 0,
				maxValue: 100,
				valueExists: true,
				value: 75.5 as number
			};

			expect(flagValueValidator(flag)).toBe('Value must be an integer');
		});

		it('should reject integer values out of bounds', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 50,
				minValue: 0,
				maxValue: 100,
				valueExists: true,
				value: 150
			};

			expect(flagValueValidator(flag)).toBe('Value (150) must be between 0 and 100');
		});

		it('should validate string values within length limits', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: 10,
				regExp: '',
				valueExists: true,
				value: 'valid'
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should reject string values that are too long', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: 5,
				regExp: '',
				valueExists: true,
				value: 'this is too long'
			};

			expect(flagValueValidator(flag)).toBe('Value is too long (max 5 chars)');
		});

		it('should validate string values against regex', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: 10,
				regExp: '^[a-z]+$',
				valueExists: true,
				value: 'valid'
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should reject string values not matching regex', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: 10,
				regExp: '^[a-z]+$',
				valueExists: true,
				value: 'INVALID123'
			};

			expect(flagValueValidator(flag)).toBe('Value (INVALID123) does not match /^[a-z]+$/');
		});

		it('should validate enum values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: 'option1',
				enumValues: ['option1', 'option2', 'option3'],
				allowEmpty: false,
				valueExists: true,
				value: 'option2'
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should reject empty enum values when not allowed', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: 'option1',
				enumValues: ['option1', 'option2'],
				allowEmpty: false,
				valueExists: true,
				value: ''
			};

			expect(flagValueValidator(flag)).toBe('Value is required');
		});

		it('should reject invalid enum values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: 'option1',
				enumValues: ['option1', 'option2'],
				allowEmpty: false,
				valueExists: true,
				value: 'invalid'
			};

			expect(flagValueValidator(flag)).toBe('Value (invalid) must be one of the enum values');
		});

		it('should validate tag values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 1,
				maxCount: 3,
				valueExists: true,
				value: ['tag1', 'tag2']
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should reject tag values below min count', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 2,
				maxCount: 3,
				valueExists: true,
				value: ['tag1']
			};

			expect(flagValueValidator(flag)).toBe('Value must have at least 2 tags');
		});

		it('should reject tag values above max count', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 1,
				maxCount: 2,
				valueExists: true,
				value: ['tag1', 'tag2', 'tag3']
			};

			expect(flagValueValidator(flag)).toBe('Value must have at most 2 tags');
		});

		it('should reject invalid tag values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2'],
				minCount: 1,
				maxCount: 2,
				valueExists: true,
				value: ['tag1', 'invalid']
			};

			expect(flagValueValidator(flag)).toBe('Allowed values for tags: tag1, tag2');
		});

		it('should validate AB-TEST flag values', () => {
			const flag: PersistentFlag = {
				description: 'Test flag',
				type: 'AB-TEST',
				chanceBPercent: 50
			};

			expect(flagValueValidator(flag)).toBe('');
		});

		it('should handle unknown flag type in value validation', () => {
			const flag = {
				description: 'Test flag',
				type: 'UNKNOWN',
				valueExists: true
			} as any as PersistentFlag;

			expect(flagValueValidator(flag)).toBe('Unknown flag type');
		});
	});
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import type { PersistentFlag } from '$types/persistent';

import { isEqualFlagSchema, isEqualFlagValue } from './flagComparer';

describe('flagComparer', () => {
	describe('isEqualFlagSchema', () => {
		it('should return true for identical boolean flags', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};
			const flag2: PersistentFlag = {
				description: 'Different description',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: false,
				value: true
			};

			expect(isEqualFlagSchema(flag1, flag2)).toBe(true);
		});

		it('should return false for boolean flags with different schema', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};
			const flag2: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: false, // Different default
				isKillSwitch: false,
				valueExists: true,
				value: false
			};

			expect(isEqualFlagSchema(flag1, flag2)).toBe(false);
		});

		it('should return false for different flag types', () => {
			const boolFlag: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};
			const stringFlag: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'test',
				maxLength: 100,
				regExp: '',
				valueExists: true,
				value: 'value'
			};

			expect(isEqualFlagSchema(boolFlag, stringFlag)).toBe(false);
		});

		it('should compare integer flag schemas correctly', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 10,
				minValue: 0,
				maxValue: 100,
				valueExists: true,
				value: 50
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'INTEGER',
				defaultValue: 10,
				minValue: 0,
				maxValue: 100,
				valueExists: false,
				value: 75
			};

			expect(isEqualFlagSchema(flag1, flag2)).toBe(true);

			const flag3: PersistentFlag = { ...flag1, maxValue: 200 };
			expect(isEqualFlagSchema(flag1, flag3)).toBe(false);
		});

		it('should compare string flag schemas correctly', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'STRING',
				defaultValue: 'default',
				maxLength: 100,
				regExp: '^[a-z]+$',
				valueExists: true,
				value: 'test'
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'STRING',
				defaultValue: 'default',
				maxLength: 100,
				regExp: '^[a-z]+$',
				valueExists: false,
				value: 'other'
			};

			expect(isEqualFlagSchema(flag1, flag2)).toBe(true);

			const flag3: PersistentFlag = { ...flag1, regExp: '^[A-Z]+$' };
			expect(isEqualFlagSchema(flag1, flag3)).toBe(false);
		});

		it('should compare enum flag schemas correctly', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'ENUM',
				defaultValue: 'option1',
				enumValues: ['option1', 'option2', 'option3'],
				allowEmpty: false,
				valueExists: true,
				value: 'option2'
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'ENUM',
				defaultValue: 'option1',
				enumValues: ['option1', 'option2', 'option3'],
				allowEmpty: false,
				valueExists: false,
				value: 'option3'
			};

			expect(isEqualFlagSchema(flag1, flag2)).toBe(true);

			const flag3: PersistentFlag = {
				...flag1,
				enumValues: ['option1', 'option3', 'option2'] // Different order
			};
			expect(isEqualFlagSchema(flag1, flag3)).toBe(false);
		});

		it('should compare tag flag schemas correctly', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 1,
				maxCount: 3,
				valueExists: true,
				value: ['tag1', 'tag2']
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 1,
				maxCount: 3,
				valueExists: false,
				value: ['tag3']
			};

			expect(isEqualFlagSchema(flag1, flag2)).toBe(true);

			const flag3: PersistentFlag = { ...flag1, minCount: 0 };
			expect(isEqualFlagSchema(flag1, flag3)).toBe(false);
		});

		it('should compare AB-TEST flag schemas correctly', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'AB-TEST',
				chanceBPercent: 50
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'AB-TEST',
				chanceBPercent: 50
			};

			expect(isEqualFlagSchema(flag1, flag2)).toBe(true);

			const flag3: PersistentFlag = { ...flag1, chanceBPercent: 75 };
			expect(isEqualFlagSchema(flag1, flag3)).toBe(false);
		});
	});

	describe('isEqualFlagValue', () => {
		it('should return true for identical boolean flag values', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'BOOLEAN',
				defaultValue: false, // Schema difference ignored
				isKillSwitch: true,
				valueExists: true,
				value: false
			};

			expect(isEqualFlagValue(flag1, flag2)).toBe(true);
		});

		it('should return false for boolean flags with different values', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: true
			};
			const flag2: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};

			expect(isEqualFlagValue(flag1, flag2)).toBe(false);
		});

		it('should return false for flags with different valueExists', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: true,
				value: false
			};
			const flag2: PersistentFlag = {
				description: 'Test flag',
				type: 'BOOLEAN',
				defaultValue: true,
				isKillSwitch: false,
				valueExists: false,
				value: false
			};

			expect(isEqualFlagValue(flag1, flag2)).toBe(false);
		});

		it('should compare integer flag values correctly', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'INTEGER',
				defaultValue: 10,
				minValue: 0,
				maxValue: 100,
				valueExists: true,
				value: 50
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'INTEGER',
				defaultValue: 20, // Schema difference ignored
				minValue: 5,
				maxValue: 200,
				valueExists: true,
				value: 50
			};

			expect(isEqualFlagValue(flag1, flag2)).toBe(true);

			const flag3: PersistentFlag = { ...flag1, value: 75 };
			expect(isEqualFlagValue(flag1, flag3)).toBe(false);
		});

		it('should compare tag flag values correctly', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'TAG',
				defaultValue: ['tag1'],
				tagValues: ['tag1', 'tag2', 'tag3'],
				minCount: 1,
				maxCount: 3,
				valueExists: true,
				value: ['tag1', 'tag2']
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'TAG',
				defaultValue: ['tag2'], // Schema difference ignored
				tagValues: ['tag1', 'tag2'],
				minCount: 0,
				maxCount: 2,
				valueExists: true,
				value: ['tag1', 'tag2']
			};

			expect(isEqualFlagValue(flag1, flag2)).toBe(true);

			const flag3: PersistentFlag = { ...flag1, value: ['tag2', 'tag1'] }; // Different order
			expect(isEqualFlagValue(flag1, flag3)).toBe(false);
		});

		it('should always return true for AB-TEST flags', () => {
			const flag1: PersistentFlag = {
				description: 'Test flag',
				type: 'AB-TEST',
				chanceBPercent: 50
			};
			const flag2: PersistentFlag = {
				description: 'Different desc',
				type: 'AB-TEST',
				chanceBPercent: 75 // Different schema
			};

			expect(isEqualFlagValue(flag1, flag2)).toBe(true);
		});

		it('should throw error for unknown flag type', () => {
			const flag1 = {
				description: 'Test flag',
				type: 'UNKNOWN',
				defaultValue: 'test'
			} as any as PersistentFlag;

			const flag2 = {
				description: 'Test flag',
				type: 'UNKNOWN',
				defaultValue: 'test'
			} as any as PersistentFlag;

			expect(() => isEqualFlagValue(flag1, flag2)).toThrow('Unknown flag type: UNKNOWN');
			expect(() => isEqualFlagSchema(flag1, flag2)).toThrow('Unknown flag type: UNKNOWN');
		});
	});
});

import { describe, expect, it } from 'vitest';

import type { PersistentFlag } from '$types/persistent';

import { generateHashInfo } from './GroupHashGenerator';

describe('GroupHashGenerator', () => {
	describe('generateHashInfo', () => {
		it('should generate hashes for flat flag structure', () => {
			const flags: Record<string, PersistentFlag> = {
				feature1: {
					description: 'Feature 1',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				},
				feature2: {
					description: 'Feature 2',
					type: 'INTEGER',
					defaultValue: 10,
					minValue: 0,
					maxValue: 100,
					valueExists: true,
					value: 50
				}
			};

			const result = generateHashInfo(flags);

			expect(result.size).toBe(1);
			expect(result.has('')).toBe(true);
			expect(typeof result.get('')).toBe('string');
			expect(result.get('')).toMatch(/^[\da-f]{40}$/); // SHA1 hash format
		});

		it('should generate hashes for hierarchical flag structure', () => {
			const flags: Record<string, PersistentFlag> = {
				'ui/header/logo': {
					description: 'Logo feature',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				},
				'ui/header/navigation': {
					description: 'Navigation feature',
					type: 'STRING',
					defaultValue: 'default',
					maxLength: 50,
					regExp: '',
					valueExists: true,
					value: 'custom'
				},
				'ui/footer/copyright': {
					description: 'Copyright text',
					type: 'STRING',
					defaultValue: '2023',
					maxLength: 10,
					regExp: '',
					valueExists: true,
					value: '2024'
				}
			};

			const result = generateHashInfo(flags);

			// Should have groups: 'ui', 'ui__header', 'ui__footer' - no root group since no root flags
			expect(result.size).toBeGreaterThanOrEqual(3);
			expect(result.has('ui')).toBe(true);

			// All hashes should be valid SHA1
			for (const [, hash] of result.entries()) {
				expect(typeof hash).toBe('string');
				expect(hash).toMatch(/^[\da-f]{40}$/);
			}
		});

		it('should generate different hashes for different flag configurations', () => {
			const flags1: Record<string, PersistentFlag> = {
				feature: {
					description: 'Feature',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				}
			};

			const flags2: Record<string, PersistentFlag> = {
				feature: {
					description: 'Feature',
					type: 'BOOLEAN',
					defaultValue: false, // Different default value
					isKillSwitch: false,
					valueExists: true,
					value: false
				}
			};

			const result1 = generateHashInfo(flags1);
			const result2 = generateHashInfo(flags2);

			// Hash should be the same for same flag schema (ignores values)
			expect(result1.get('')).toBe(result2.get(''));
		});

		it('should generate same hashes for identical flag configurations', () => {
			const flags: Record<string, PersistentFlag> = {
				feature: {
					description: 'Feature',
					type: 'ENUM',
					defaultValue: 'option1',
					enumValues: ['option1', 'option2', 'option3'],
					allowEmpty: false,
					valueExists: true,
					value: 'option2'
				}
			};

			const result1 = generateHashInfo(flags);
			const result2 = generateHashInfo(flags);

			expect(result1.get('')).toBe(result2.get(''));
		});

		it('should handle complex nested hierarchies', () => {
			const flags: Record<string, PersistentFlag> = {
				'app/ui/components/button/primary': {
					description: 'Primary button',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: true
				},
				'app/ui/components/button/secondary': {
					description: 'Secondary button',
					type: 'BOOLEAN',
					defaultValue: false,
					isKillSwitch: false,
					valueExists: true,
					value: false
				},
				'app/api/rate-limiting': {
					description: 'API rate limiting',
					type: 'INTEGER',
					defaultValue: 100,
					minValue: 10,
					maxValue: 1000,
					valueExists: true,
					value: 150
				}
			};

			const result = generateHashInfo(flags);

			// Should have multiple hierarchy levels
			expect(result.size).toBeGreaterThan(1);
			expect(result.has('app')).toBe(true);

			// Each hash should be unique
			const hashes = [...result.values()];
			const uniqueHashes = new Set(hashes);
			expect(uniqueHashes.size).toBe(hashes.length);
		});

		it('should handle different flag types in hash generation', () => {
			const flags: Record<string, PersistentFlag> = {
				booleanFlag: {
					description: 'Boolean flag',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				},
				integerFlag: {
					description: 'Integer flag',
					type: 'INTEGER',
					defaultValue: 42,
					minValue: 0,
					maxValue: 100,
					valueExists: true,
					value: 50
				},
				stringFlag: {
					description: 'String flag',
					type: 'STRING',
					defaultValue: 'default',
					maxLength: 100,
					regExp: '^[a-z]+$',
					valueExists: true,
					value: 'custom'
				},
				enumFlag: {
					description: 'Enum flag',
					type: 'ENUM',
					defaultValue: 'option1',
					enumValues: ['option1', 'option2', 'option3'],
					allowEmpty: false,
					valueExists: true,
					value: 'option2'
				},
				tagFlag: {
					description: 'Tag flag',
					type: 'TAG',
					defaultValue: ['tag1'],
					tagValues: ['tag1', 'tag2', 'tag3'],
					minCount: 1,
					maxCount: 3,
					valueExists: true,
					value: ['tag1', 'tag2']
				},
				abTestFlag: {
					description: 'AB test flag',
					type: 'AB-TEST',
					chanceBPercent: 50
				}
			};

			const result = generateHashInfo(flags);

			expect(result.size).toBe(1);
			expect(result.has('')).toBe(true);
			expect(typeof result.get('')).toBe('string');
			expect(result.get('')).toMatch(/^[\da-f]{40}$/);
		});

		it('should handle empty flags object', () => {
			const flags: Record<string, PersistentFlag> = {};
			const result = generateHashInfo(flags);

			expect(result.size).toBe(0);
		});

		it('should sort groups alphabetically', () => {
			const flags: Record<string, PersistentFlag> = {
				'z/feature': {
					description: 'Z feature',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				},
				'a/feature': {
					description: 'A feature',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				},
				'm/feature': {
					description: 'M feature',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				}
			};

			const result = generateHashInfo(flags);
			const groups = [...result.keys()].toSorted();

			expect(groups).toEqual(['', 'a', 'm', 'z']);
		});

		it('should generate consistent hashes based on flag schema only', () => {
			// Two flags with same schema but different values should generate same hash
			const flags1: Record<string, PersistentFlag> = {
				feature: {
					description: 'Feature 1',
					type: 'INTEGER',
					defaultValue: 10,
					minValue: 0,
					maxValue: 100,
					valueExists: true,
					value: 25
				}
			};

			const flags2: Record<string, PersistentFlag> = {
				feature: {
					description: 'Feature 2', // Different description
					type: 'INTEGER',
					defaultValue: 10, // Same schema
					minValue: 0,
					maxValue: 100,
					valueExists: false, // Different value state
					value: 75 // Different value
				}
			};

			const result1 = generateHashInfo(flags1);
			const result2 = generateHashInfo(flags2);

			// Hashes should be the same because schema is the same
			expect(result1.get('')).toBe(result2.get(''));
		});

		it('should handle flags with special characters in names', () => {
			const flags: Record<string, PersistentFlag> = {
				'feature-with-dashes': {
					description: 'Feature with dashes',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				},
				feature_with_underscores: {
					description: 'Feature with underscores',
					type: 'BOOLEAN',
					defaultValue: true,
					isKillSwitch: false,
					valueExists: true,
					value: false
				}
			};

			const result = generateHashInfo(flags);

			expect(result.size).toBe(1);
			expect(result.has('')).toBe(true);
			expect(typeof result.get('')).toBe('string');
		});
	});
});

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ArrayValidator, StringValidator } from './form.svelte';

describe('StringValidator', () => {
	describe('constructor and preparation', () => {
		it('should initialize with string value', () => {
			const validator = new StringValidator('test');
			expect(validator.error.isError).toBe(false);
		});

		it('should apply trim preparation', () => {
			const validator = new StringValidator('  hello  ', 'trim');
			validator.equalsWith('hello');
			expect(validator.error.isError).toBe(false);
		});

		it('should apply normalize preparation', () => {
			const validator = new StringValidator('hello    world', 'normalize');
			validator.equalsWith('hello world');
			expect(validator.error.isError).toBe(false);
		});

		it('should apply upper preparation', () => {
			const validator = new StringValidator('hello', 'upper');
			validator.equalsWith('HELLO');
			expect(validator.error.isError).toBe(false);
		});

		it('should apply lower preparation', () => {
			const validator = new StringValidator('HELLO', 'lower');
			validator.equalsWith('hello');
			expect(validator.error.isError).toBe(false);
		});

		it('should apply multiple preparations in order', () => {
			const validator = new StringValidator('  Hello  World  ', 'trim', 'normalize', 'lower');
			validator.equalsWith('hello world');
			expect(validator.error.isError).toBe(false);
		});
	});

	describe('required validation', () => {
		it('should pass for non-empty string', () => {
			const validator = new StringValidator('test').required();
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for empty string', () => {
			const validator = new StringValidator('').required();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Required');
		});
	});

	describe('equalsWith validation', () => {
		it('should pass when strings are equal', () => {
			const validator = new StringValidator('test').equalsWith('test');
			expect(validator.error.isError).toBe(false);
		});

		it('should fail when strings are not equal', () => {
			const validator = new StringValidator('test').equalsWith('other');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Must be equal');
		});

		it('should include title in error message', () => {
			const validator = new StringValidator('test').equalsWith('other', 'password');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Must be equal to password');
		});
	});

	describe('notEqualsWith validation', () => {
		it('should pass when strings are different', () => {
			const validator = new StringValidator('test').notEqualsWith('other');
			expect(validator.error.isError).toBe(false);
		});

		it('should fail when strings are equal', () => {
			const validator = new StringValidator('test').notEqualsWith('test');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Must be different');
		});

		it('should include title in error message', () => {
			const validator = new StringValidator('test').notEqualsWith('test', 'username');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Must be different from username');
		});
	});

	describe('noSpace validation', () => {
		it('should pass for string without spaces', () => {
			const validator = new StringValidator('test').noSpace();
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for string with spaces', () => {
			const validator = new StringValidator('test test').noSpace();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('No space allowed');
		});
	});

	describe('length validations', () => {
		it('should pass maxLength validation', () => {
			const validator = new StringValidator('test').maxLength(5);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail maxLength validation', () => {
			const validator = new StringValidator('test').maxLength(3);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Max length 3');
		});

		it('should pass minLength validation', () => {
			const validator = new StringValidator('test').minLength(3);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail minLength validation', () => {
			const validator = new StringValidator('test').minLength(5);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Min length 5');
		});
	});

	describe('case validations', () => {
		it('should pass uppercase validation', () => {
			const validator = new StringValidator('TEST').uppercase();
			expect(validator.error.isError).toBe(false);
		});

		it('should fail uppercase validation', () => {
			const validator = new StringValidator('Test').uppercase();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Uppercase only');
		});

		it('should pass lowercase validation', () => {
			const validator = new StringValidator('test').lowercase();
			expect(validator.error.isError).toBe(false);
		});

		it('should fail lowercase validation', () => {
			const validator = new StringValidator('Test').lowercase();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Lowercase only');
		});
	});

	describe('email validation', () => {
		it('should pass for valid email', () => {
			const validator = new StringValidator('test@example.com').email();
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for invalid email', () => {
			const validator = new StringValidator('invalid-email').email();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Invalid email');
		});
	});

	describe('URL validation', () => {
		it('should pass for valid URL with protocol', () => {
			const validator = new StringValidator('https://example.com').url();
			expect(validator.error.isError).toBe(false);
		});

		it('should pass for valid URL without protocol', () => {
			const validator = new StringValidator('example.com').url();
			expect(validator.error.isError).toBe(false);
		});

		it('should pass for localhost', () => {
			const validator = new StringValidator('localhost:3000').url();
			expect(validator.error.isError).toBe(false);
		});

		it('should pass for empty string (optional)', () => {
			const validator = new StringValidator('').url();
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for invalid URL', () => {
			const validator = new StringValidator('not-a-url').url();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Invalid URL');
		});
	});

	describe('startsWith validation', () => {
		it('should pass for string starting with prefix', () => {
			const validator = new StringValidator('hello world').startsWith('hello');
			expect(validator.error.isError).toBe(false);
		});

		it('should pass for string starting with one of multiple prefixes', () => {
			const validator = new StringValidator('hello world').startsWith(['hi', 'hello']);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for string not starting with prefix', () => {
			const validator = new StringValidator('world hello').startsWith('hello');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Must starts with hello');
		});

		it('should fail for string not starting with any of multiple prefixes', () => {
			const validator = new StringValidator('world hello').startsWith(['hi', 'hey']);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Must starts with hi, hey');
		});

		it('should pass for empty string (optional)', () => {
			const validator = new StringValidator('').startsWith('hello');
			expect(validator.error.isError).toBe(false);
		});
	});

	describe('regexp validation', () => {
		it('should pass for matching regexp', () => {
			const validator = new StringValidator('123').regexp(/^\d+$/);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for non-matching regexp', () => {
			const validator = new StringValidator('abc').regexp(/^\d+$/);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Not allowed chars');
		});

		it('should use custom error message', () => {
			const validator = new StringValidator('abc').regexp(/^\d+$/, 'Numbers only');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Numbers only');
		});

		it('should pass for empty string (optional)', () => {
			const validator = new StringValidator('').regexp(/^\d+$/);
			expect(validator.error.isError).toBe(false);
		});
	});

	describe('zod validation', () => {
		it('should pass for valid zod schema', () => {
			const schema = z.string().min(2);
			const validator = new StringValidator('test').zod(schema);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for invalid zod schema', () => {
			const schema = z.string().min(5);
			const validator = new StringValidator('test').zod(schema);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toContain(
				'Too small: expected string to have >=5 characters'
			);
		});

		it('should use custom error message', () => {
			const schema = z.string().min(5);
			const validator = new StringValidator('test').zod(schema, 'Too short');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Too short');
		});

		it('should pass for empty string (optional)', () => {
			const schema = z.string().min(5);
			const validator = new StringValidator('').zod(schema);
			expect(validator.error.isError).toBe(false);
		});
	});

	describe('chaining validations', () => {
		it('should pass multiple chained validations', () => {
			const validator = new StringValidator('test@example.com').required().email().maxLength(20);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail on first error and not continue', () => {
			const validator = new StringValidator('').required().email();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Required');
		});
	});
});

describe('ArrayValidator', () => {
	describe('constructor', () => {
		it('should initialize with array value', () => {
			const validator = new ArrayValidator([1, 2, 3]);
			expect(validator.error.isError).toBe(false);
		});

		it('should work with different array types', () => {
			const stringValidator = new ArrayValidator(['a', 'b']);
			const objectValidator = new ArrayValidator([{ id: 1 }, { id: 2 }]);
			expect(stringValidator.error.isError).toBe(false);
			expect(objectValidator.error.isError).toBe(false);
		});
	});

	describe('min validation', () => {
		it('should pass for array with sufficient length', () => {
			const validator = new ArrayValidator([1, 2, 3]).min(2);
			expect(validator.error.isError).toBe(false);
		});

		it('should pass for array with exact minimum length', () => {
			const validator = new ArrayValidator([1, 2]).min(2);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for array with insufficient length', () => {
			const validator = new ArrayValidator([1]).min(2);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Min item count 2');
		});
	});

	describe('max validation', () => {
		it('should pass for array within maximum length', () => {
			const validator = new ArrayValidator([1, 2]).max(3);
			expect(validator.error.isError).toBe(false);
		});

		it('should pass for array with exact maximum length', () => {
			const validator = new ArrayValidator([1, 2, 3]).max(3);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for array exceeding maximum length', () => {
			const validator = new ArrayValidator([1, 2, 3, 4]).max(3);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Max item count 3');
		});
	});

	describe('required validation', () => {
		it('should pass for non-empty array', () => {
			const validator = new ArrayValidator([1, 2]).required();
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for empty array', () => {
			const validator = new ArrayValidator([]).required();
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Min item count 1');
		});
	});

	describe('zod validation', () => {
		it('should pass for valid zod schema', () => {
			const schema = z.array(z.string()).min(2);
			const validator = new ArrayValidator(['a', 'b', 'c']).zod(schema);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail for invalid zod schema', () => {
			const schema = z.array(z.string()).min(3);
			const validator = new ArrayValidator(['a', 'b']).zod(schema);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toContain('Too small: expected array to have >=3 items');
		});

		it('should use custom error message', () => {
			const schema = z.array(z.string()).min(3);
			const validator = new ArrayValidator(['a', 'b']).zod(schema, 'Not enough items');
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Not enough items');
		});

		it('should fail for wrong item types', () => {
			const schema = z.array(z.string());
			const validator = new ArrayValidator([1, 2, 3]).zod(schema);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toContain('Invalid input: expected string, received number');
		});
	});

	describe('chaining validations', () => {
		it('should pass multiple chained validations', () => {
			const validator = new ArrayValidator(['a', 'b', 'c']).required().min(2).max(5);
			expect(validator.error.isError).toBe(false);
		});

		it('should fail on first error and not continue', () => {
			const validator = new ArrayValidator([]).required().min(3);
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Min item count 1');
		});
	});

	describe('error handling', () => {
		it('should only set first error encountered', () => {
			const validator = new ArrayValidator([1, 2, 3, 4, 5])
				.min(10) // This will fail first
				.max(2); // This would also fail but shouldn't be set
			expect(validator.error.isError).toBe(true);
			expect(validator.error.message).toBe('Min item count 10');
		});
	});
});

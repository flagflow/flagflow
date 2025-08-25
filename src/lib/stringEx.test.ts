import { describe, expect, it } from 'vitest';

import {
	camelCaseToHuman,
	capitalize,
	capitalizeWords,
	trim,
	trimEnd,
	trimStart
} from './stringEx';

describe('stringEx', () => {
	describe('trim', () => {
		it('should trim characters from both ends', () => {
			expect(trim('  hello  ', ' ')).toBe('hello');
			expect(trim('xxhelloxx', 'x')).toBe('hello');
			expect(trim('abcdefgab', 'ab')).toBe('cdefg');
		});

		it('should handle empty string', () => {
			expect(trim('', ' ')).toBe('');
		});

		it('should handle string with no matching chars', () => {
			expect(trim('hello', 'x')).toBe('hello');
		});

		it('should handle string that is all trim chars', () => {
			expect(trim('xxx', 'x')).toBe('');
		});
	});

	describe('trimStart', () => {
		it('should trim characters from start only', () => {
			expect(trimStart('  hello  ', ' ')).toBe('hello  ');
			expect(trimStart('xxhelloxx', 'x')).toBe('helloxx');
			expect(trimStart('abcdefgab', 'ab')).toBe('cdefgab');
		});

		it('should handle empty string', () => {
			expect(trimStart('', ' ')).toBe('');
		});

		it('should handle string with no matching start chars', () => {
			expect(trimStart('hello', 'x')).toBe('hello');
		});
	});

	describe('trimEnd', () => {
		it('should trim characters from end only', () => {
			expect(trimEnd('  hello  ', ' ')).toBe('  hello');
			expect(trimEnd('xxhelloxx', 'x')).toBe('xxhello');
			expect(trimEnd('abcdefgab', 'ab')).toBe('abcdefg');
		});

		it('should handle empty string', () => {
			expect(trimEnd('', ' ')).toBe('');
		});

		it('should handle string with no matching end chars', () => {
			expect(trimEnd('hello', 'x')).toBe('hello');
		});
	});

	describe('camelCaseToHuman', () => {
		it('should convert camelCase to human readable', () => {
			expect(camelCaseToHuman('firstName')).toBe('First name');
			expect(camelCaseToHuman('getUserName')).toBe('Get user name');
			expect(camelCaseToHuman('XMLHttpRequest')).toBe('Xmlhttp request');
		});

		it('should handle single word', () => {
			expect(camelCaseToHuman('hello')).toBe('Hello');
		});

		it('should handle already lowercase', () => {
			expect(camelCaseToHuman('hello world')).toBe('Hello world');
		});

		it('should handle empty string', () => {
			expect(camelCaseToHuman('')).toBe('');
		});
	});

	describe('capitalize', () => {
		it('should capitalize first letter and lowercase rest', () => {
			expect(capitalize('hello')).toBe('Hello');
			expect(capitalize('HELLO')).toBe('Hello');
			expect(capitalize('hELLO')).toBe('Hello');
		});

		it('should handle single character', () => {
			expect(capitalize('h')).toBe('H');
		});

		it('should handle empty string', () => {
			expect(capitalize('')).toBe('');
		});
	});

	describe('capitalizeWords', () => {
		it('should capitalize words separated by given separator', () => {
			expect(capitalizeWords('hello world', ' ')).toBe('Hello World');
			expect(capitalizeWords('first-name-last', '-')).toBe('First-Name-Last');
			expect(capitalizeWords('one_two_three', '_')).toBe('One_Two_Three');
		});

		it('should handle single word', () => {
			expect(capitalizeWords('hello', ' ')).toBe('Hello');
		});

		it('should handle empty string', () => {
			expect(capitalizeWords('', ' ')).toBe('');
		});

		it('should handle mixed case input', () => {
			expect(capitalizeWords('hELLo WoRLD', ' ')).toBe('Hello World');
		});
	});
});

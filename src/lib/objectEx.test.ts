/* eslint-disable unicorn/no-null */
import { describe, expect, it } from 'vitest';

import {
	filterObjectFields,
	isStringArray,
	joinLookupData,
	makeObjectHumanReadable,
	searchObjectStringField,
	sortMapByKey,
	sortObjectByKey,
	trimObjectValues
} from './objectEx';

describe('objectEx', () => {
	describe('sortObjectByKey', () => {
		it('should sort object keys alphabetically', () => {
			const input = { c: 3, a: 1, b: 2 };
			const result = sortObjectByKey(input);
			expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
			expect(result).toEqual({ a: 1, b: 2, c: 3 });
		});

		it('should handle empty object', () => {
			const result = sortObjectByKey({});
			expect(result).toEqual({});
		});

		it('should maintain type safety', () => {
			const input = { z: 'last', a: 'first' };
			const result = sortObjectByKey(input);
			expect(result.a).toBe('first');
			expect(result.z).toBe('last');
		});
	});

	describe('sortMapByKey', () => {
		it('should sort map by keys ascending by default', () => {
			const input = new Map([
				['c', 3],
				['a', 1],
				['b', 2]
			]);
			const result = sortMapByKey(input);
			expect([...result.keys()]).toEqual(['a', 'b', 'c']);
		});

		it('should sort map by keys descending when reverse is true', () => {
			const input = new Map([
				['c', 3],
				['a', 1],
				['b', 2]
			]);
			const result = sortMapByKey(input, true);
			expect([...result.keys()]).toEqual(['c', 'b', 'a']);
		});

		it('should handle empty map', () => {
			const result = sortMapByKey(new Map());
			expect(result.size).toBe(0);
		});
	});

	describe('filterObjectFields', () => {
		it('should filter object to only allowed keys', () => {
			const input = { name: 'John', age: 25, city: 'NYC', country: 'USA' };
			const result = filterObjectFields(input, ['name', 'age']);
			expect(result).toEqual({ name: 'John', age: 25 });
		});

		it('should handle non-existent keys', () => {
			const input = { name: 'John', age: 25 };
			const result = filterObjectFields(input, ['name', 'height']);
			expect(result).toEqual({ name: 'John' });
		});

		it('should handle empty allowed keys', () => {
			const input = { name: 'John', age: 25 };
			const result = filterObjectFields(input, []);
			expect(result).toEqual({});
		});
	});

	describe('trimObjectValues', () => {
		it('should trim string values in object', () => {
			const input = { name: '  John  ', city: ' NYC ', age: 25 };
			const result = trimObjectValues(input);
			expect(result).toEqual({ name: 'John', city: 'NYC', age: 25 });
		});

		it('should not affect non-string values', () => {
			const input = { name: '  John  ', age: 25, active: true };
			const result = trimObjectValues(input);
			expect(result).toEqual({ name: 'John', age: 25, active: true });
		});

		it('should handle empty strings', () => {
			const input = { name: '   ', city: '' };
			const result = trimObjectValues(input);
			expect(result).toEqual({ name: '', city: '' });
		});

		it('should handle null/undefined object', () => {
			expect(trimObjectValues(null as unknown as Record<string, unknown>)).toBeNull();
		});
	});

	describe('makeObjectHumanReadable', () => {
		it('should convert camelCase keys to human readable', () => {
			const input = { firstName: 'John', lastName: 'Doe' };
			const result = makeObjectHumanReadable(input);
			expect(result).toEqual({ 'First name': 'John', 'Last name': 'Doe' });
		});

		it('should sort keys alphabetically by human readable form', () => {
			const input = { lastName: 'Doe', firstName: 'John' };
			const result = makeObjectHumanReadable(input);
			expect(Object.keys(result)).toEqual(['First name', 'Last name']);
		});

		it('should trim quotes from JSON stringified values', () => {
			const input = { name: '"John"', age: '25' };
			const result = makeObjectHumanReadable(input);
			expect(result['Name']).toBe('\\"John\\'); // JSON.stringify adds quotes, trim removes outer quotes
			expect(result['Age']).toBe('25');
		});
	});

	describe('isStringArray', () => {
		it('should return true for array of strings', () => {
			expect(isStringArray(['a', 'b', 'c'])).toBe(true);
			expect(isStringArray([])).toBe(true);
		});

		it('should return false for mixed arrays', () => {
			expect(isStringArray(['a', 1, 'c'])).toBe(false);
			expect(isStringArray([1, 2, 3])).toBe(false);
		});

		it('should return false for non-arrays', () => {
			expect(isStringArray('string')).toBe(false);
			expect(isStringArray({ 0: 'a', length: 1 })).toBe(false);
		});
	});

	describe('searchObjectStringField', () => {
		const items = [
			{ name: 'John Doe', tags: ['developer', 'javascript'] },
			{ name: 'Jane Smith', tags: ['designer', 'css'] },
			{ name: 'Bob Johnson', age: 30 }
		];

		it('should find items by string field content', () => {
			expect(searchObjectStringField(items[0], 'john')).toBe(true);
			expect(searchObjectStringField(items[0], 'Jane')).toBe(false);
		});

		it('should find items by array field content', () => {
			expect(searchObjectStringField(items[0], 'javascript')).toBe(true);
			expect(searchObjectStringField(items[1], 'css')).toBe(true);
			expect(searchObjectStringField(items[0], 'python')).toBe(false);
		});

		it('should handle multiple search terms (AND logic)', () => {
			expect(searchObjectStringField(items[0], ['john', 'javascript'])).toBe(true);
			expect(searchObjectStringField(items[0], ['john', 'python'])).toBe(false);
		});

		it('should be case insensitive', () => {
			expect(searchObjectStringField(items[0], 'JOHN')).toBe(true);
			expect(searchObjectStringField(items[0], 'JAVASCRIPT')).toBe(true);
		});

		it('should handle non-string fields gracefully', () => {
			expect(searchObjectStringField(items[2], '30')).toBe(false);
		});
	});

	describe('joinLookupData', () => {
		const products = [
			{ id: 1, name: 'Product A', categoryId: 100 },
			{ id: 2, name: 'Product B', categoryId: 200 },
			{ id: 3, name: 'Product C', categoryId: null }
		];

		const categories = [
			{ id: 100, name: 'Electronics' },
			{ id: 200, name: 'Books' }
		];

		it('should join lookup data correctly', () => {
			const result = joinLookupData(products, categories, 'categoryName', {
				localId: 'categoryId',
				remoteId: 'id',
				remoteValue: 'name'
			});

			expect(result[0]).toEqual({
				id: 1,
				name: 'Product A',
				categoryId: 100,
				categoryName: 'Electronics'
			});
			expect(result[1]).toEqual({
				id: 2,
				name: 'Product B',
				categoryId: 200,
				categoryName: 'Books'
			});
		});

		it('should handle null foreign keys', () => {
			const result = joinLookupData(products, categories, 'categoryName', {
				localId: 'categoryId',
				remoteId: 'id',
				remoteValue: 'name'
			});

			expect(result[2]).toEqual({
				id: 3,
				name: 'Product C',
				categoryId: null,
				categoryName: undefined
			});
		});

		it('should handle missing lookup data', () => {
			const productsWithMissingCategory = [{ id: 1, name: 'Product A', categoryId: 999 }];

			const result = joinLookupData(productsWithMissingCategory, categories, 'categoryName', {
				localId: 'categoryId',
				remoteId: 'id',
				remoteValue: 'name'
			});

			expect(result[0].categoryName).toBeUndefined();
		});
	});
});

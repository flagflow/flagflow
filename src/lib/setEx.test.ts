import { describe, expect, it } from 'vitest';

import { arrayDiff, entitySymmetricDiff, objectSymmetricDiff } from './setEx';

describe('setEx', () => {
	describe('arrayDiff', () => {
		it('should return elements in first array but not in second', () => {
			expect(arrayDiff([1, 2, 3], [2, 3, 4])).toEqual([1]);
			expect(arrayDiff(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['a']);
		});

		it('should return empty array when no differences', () => {
			expect(arrayDiff([1, 2, 3], [1, 2, 3])).toEqual([]);
		});

		it('should return all elements when no overlap', () => {
			expect(arrayDiff([1, 2], [3, 4])).toEqual([1, 2]);
		});

		it('should handle empty arrays', () => {
			expect(arrayDiff([], [1, 2])).toEqual([]);
			expect(arrayDiff([1, 2], [])).toEqual([1, 2]);
			expect(arrayDiff([], [])).toEqual([]);
		});

		it('should handle duplicate elements', () => {
			expect(arrayDiff([1, 1, 2], [1, 3])).toEqual([2]);
		});
	});

	describe('entitySymmetricDiff', () => {
		it('should return insert and drop arrays', () => {
			const current = [1, 2, 3];
			const requirement = [2, 3, 4, 5];
			const result = entitySymmetricDiff(current, requirement);

			expect(result.insert).toEqual([4, 5]);
			expect(result.drop).toEqual([1]);
		});

		it('should handle identical arrays', () => {
			const current = [1, 2, 3];
			const requirement = [1, 2, 3];
			const result = entitySymmetricDiff(current, requirement);

			expect(result.insert).toEqual([]);
			expect(result.drop).toEqual([]);
		});

		it('should handle empty arrays', () => {
			const result1 = entitySymmetricDiff([], [1, 2]);
			expect(result1.insert).toEqual([1, 2]);
			expect(result1.drop).toEqual([]);

			const result2 = entitySymmetricDiff([1, 2], []);
			expect(result2.insert).toEqual([]);
			expect(result2.drop).toEqual([1, 2]);
		});

		it('should work with string arrays', () => {
			const current = ['a', 'b'];
			const requirement = ['b', 'c'];
			const result = entitySymmetricDiff(current, requirement);

			expect(result.insert).toEqual(['c']);
			expect(result.drop).toEqual(['a']);
		});
	});

	describe('objectSymmetricDiff', () => {
		it('should categorize object changes correctly', () => {
			const current = { a: 1, b: 2, c: 3 } as Record<string, number>;
			const requirement = { b: 20, c: 3, d: 4 } as Record<string, number>;
			const result = objectSymmetricDiff(current, requirement);

			expect(result.insert).toEqual({ d: 4 });
			expect(result.update).toEqual({ b: 20, c: 3 });
			expect(result.drop).toEqual({ a: 1 });
		});

		it('should handle identical objects', () => {
			const current = { a: 1, b: 2 };
			const requirement = { a: 1, b: 2 };
			const result = objectSymmetricDiff(current, requirement);

			expect(result.insert).toEqual({});
			expect(result.update).toEqual({ a: 1, b: 2 });
			expect(result.drop).toEqual({});
		});

		it('should handle empty objects', () => {
			const result1 = objectSymmetricDiff(
				{} as Record<string, number>,
				{ a: 1 } as Record<string, number>
			);
			expect(result1.insert).toEqual({ a: 1 });
			expect(result1.update).toEqual({});
			expect(result1.drop).toEqual({});

			const result2 = objectSymmetricDiff(
				{ a: 1 } as Record<string, number>,
				{} as Record<string, number>
			);
			expect(result2.insert).toEqual({});
			expect(result2.update).toEqual({});
			expect(result2.drop).toEqual({ a: 1 });
		});

		it('should work with string keys and values', () => {
			const current = { name: 'John', age: '25' } as Record<string, string>;
			const requirement = { name: 'Jane', city: 'NYC' } as Record<string, string>;
			const result = objectSymmetricDiff(current, requirement);

			expect(result.insert).toEqual({ city: 'NYC' });
			expect(result.update).toEqual({ name: 'Jane' });
			expect(result.drop).toEqual({ age: '25' });
		});

		it('should work with numeric keys', () => {
			const current = { 1: 'one', 2: 'two' } as Record<number, string>;
			const requirement = { 2: 'TWO', 3: 'three' } as Record<number, string>;
			const result = objectSymmetricDiff(current, requirement);

			expect(result.insert).toEqual({ 3: 'three' });
			expect(result.update).toEqual({ 2: 'TWO' });
			expect(result.drop).toEqual({ 1: 'one' });
		});
	});
});

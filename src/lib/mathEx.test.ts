import { describe, expect, it } from 'vitest';

import { clamp, roundTo } from './mathEx';

describe('mathEx', () => {
	describe('roundTo', () => {
		it('should round to specified digits', () => {
			expect(roundTo(3.141_59, 2)).toBe(3.14);
			expect(roundTo(3.141_59, 4)).toBe(3.1416);
			expect(roundTo(3.141_59, 0)).toBe(3);
		});

		it('should handle negative numbers', () => {
			expect(roundTo(-3.141_59, 2)).toBe(-3.14);
			expect(roundTo(-3.161_59, 2)).toBe(-3.16);
		});

		it('should handle zero digits', () => {
			expect(roundTo(3.9, 0)).toBe(4);
			expect(roundTo(3.1, 0)).toBe(3);
		});

		it('should handle large digit counts', () => {
			expect(roundTo(1.123_456_789, 8)).toBe(1.123_456_79);
		});

		it('should handle integer input', () => {
			expect(roundTo(5, 2)).toBe(5);
		});

		it('should handle zero input', () => {
			expect(roundTo(0, 2)).toBe(0);
		});
	});

	describe('clamp', () => {
		it('should clamp value within bounds', () => {
			expect(clamp(5, 1, 10)).toBe(5);
			expect(clamp(0, 1, 10)).toBe(1);
			expect(clamp(15, 1, 10)).toBe(10);
		});

		it('should handle value at boundaries', () => {
			expect(clamp(1, 1, 10)).toBe(1);
			expect(clamp(10, 1, 10)).toBe(10);
		});

		it('should handle negative values', () => {
			expect(clamp(-5, -10, -1)).toBe(-5);
			expect(clamp(-15, -10, -1)).toBe(-10);
			expect(clamp(0, -10, -1)).toBe(-1);
		});

		it('should handle floating point values', () => {
			expect(clamp(2.5, 1.1, 3.7)).toBe(2.5);
			expect(clamp(0.5, 1.1, 3.7)).toBe(1.1);
			expect(clamp(4.2, 1.1, 3.7)).toBe(3.7);
		});

		it('should handle equal min and max', () => {
			expect(clamp(5, 3, 3)).toBe(3);
			expect(clamp(1, 3, 3)).toBe(3);
		});
	});
});

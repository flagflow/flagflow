import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	dateAdd,
	dateAddDays,
	dateAddHours,
	dateAddMinutes,
	dateAddSeconds,
	dateDiffDays,
	getRelativeDateString
} from './dateEx';

describe('dateEx', () => {
	const baseDate = new Date('2023-01-01T12:00:00Z');

	describe('dateAdd', () => {
		it('should add days, hours, minutes, and seconds correctly', () => {
			const result = dateAdd(baseDate, 1, 2, 30, 45);
			const expected = new Date('2023-01-02T14:30:45Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle negative values', () => {
			const result = dateAdd(baseDate, -1, -2, -30, -45);
			const expected = new Date('2022-12-31T09:29:15Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should default to zero for omitted parameters', () => {
			const result = dateAdd(baseDate);
			expect(result.getTime()).toBe(baseDate.getTime());
		});

		it('should handle mixed positive and negative values', () => {
			const result = dateAdd(baseDate, 1, -12, 60, -30);
			const expected = new Date('2023-01-02T00:59:30Z');
			expect(result.getTime()).toBe(expected.getTime());
		});
	});

	describe('dateAddSeconds', () => {
		it('should add seconds correctly', () => {
			const result = dateAddSeconds(baseDate, 45);
			const expected = new Date('2023-01-01T12:00:45Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle negative seconds', () => {
			const result = dateAddSeconds(baseDate, -30);
			const expected = new Date('2023-01-01T11:59:30Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle large second values', () => {
			const result = dateAddSeconds(baseDate, 3661); // 1 hour, 1 minute, 1 second
			const expected = new Date('2023-01-01T13:01:01Z');
			expect(result.getTime()).toBe(expected.getTime());
		});
	});

	describe('dateAddMinutes', () => {
		it('should add minutes correctly', () => {
			const result = dateAddMinutes(baseDate, 30);
			const expected = new Date('2023-01-01T12:30:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle negative minutes', () => {
			const result = dateAddMinutes(baseDate, -15);
			const expected = new Date('2023-01-01T11:45:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle minutes that cross hour boundaries', () => {
			const result = dateAddMinutes(baseDate, 90);
			const expected = new Date('2023-01-01T13:30:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});
	});

	describe('dateAddHours', () => {
		it('should add hours correctly', () => {
			const result = dateAddHours(baseDate, 6);
			const expected = new Date('2023-01-01T18:00:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle negative hours', () => {
			const result = dateAddHours(baseDate, -6);
			const expected = new Date('2023-01-01T06:00:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle hours that cross day boundaries', () => {
			const result = dateAddHours(baseDate, 24);
			const expected = new Date('2023-01-02T12:00:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});
	});

	describe('dateAddDays', () => {
		it('should add days correctly', () => {
			const result = dateAddDays(baseDate, 7);
			const expected = new Date('2023-01-08T12:00:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle negative days', () => {
			const result = dateAddDays(baseDate, -10);
			const expected = new Date('2022-12-22T12:00:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});

		it('should handle month and year boundaries', () => {
			const result = dateAddDays(baseDate, 365);
			const expected = new Date('2024-01-01T12:00:00Z');
			expect(result.getTime()).toBe(expected.getTime());
		});
	});

	describe('dateDiffDays', () => {
		it('should calculate positive day difference', () => {
			const laterDate = new Date('2023-01-08T12:00:00Z');
			const result = dateDiffDays(laterDate, baseDate);
			expect(result).toBe(7);
		});

		it('should calculate negative day difference', () => {
			const earlierDate = new Date('2022-12-25T12:00:00Z');
			const result = dateDiffDays(earlierDate, baseDate);
			expect(result).toBe(-7);
		});

		it('should handle same date', () => {
			const result = dateDiffDays(baseDate, baseDate);
			expect(result).toBe(0);
		});

		it('should handle partial days correctly', () => {
			const date1 = new Date('2023-01-01T23:59:59Z');
			const date2 = new Date('2023-01-02T00:00:01Z');
			const result = dateDiffDays(date2, date1);
			expect(result).toBe(0); // Less than 24 hours difference
		});

		it('should handle cross-month differences', () => {
			const date1 = new Date('2023-01-31T12:00:00Z');
			const date2 = new Date('2023-02-28T12:00:00Z');
			const result = dateDiffDays(date2, date1);
			expect(result).toBe(28);
		});
	});

	describe('getRelativeDateString', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return relative date string from now', () => {
			const now = new Date('2023-01-01T12:00:00Z');
			vi.setSystemTime(now);

			const pastDate = new Date('2023-01-01T11:00:00Z');
			const result = getRelativeDateString(pastDate);
			expect(result).toBe('about 1 hour ago');
		});

		it('should return relative date string from custom base date', () => {
			const baseDate = new Date('2023-01-01T12:00:00Z');
			const pastDate = new Date('2023-01-01T10:00:00Z');
			const result = getRelativeDateString(pastDate, baseDate);
			expect(result).toBe('about 2 hours ago');
		});

		it('should handle future dates', () => {
			const now = new Date('2023-01-01T12:00:00Z');
			vi.setSystemTime(now);

			const futureDate = new Date('2023-01-01T13:00:00Z');
			const result = getRelativeDateString(futureDate);
			expect(result).toBe('in about 1 hour');
		});

		it('should handle same date', () => {
			const now = new Date('2023-01-01T12:00:00Z');
			vi.setSystemTime(now);

			const result = getRelativeDateString(now);
			expect(result).toBe('less than a minute ago');
		});

		it('should handle different time units', () => {
			const now = new Date('2023-01-01T12:00:00Z');
			vi.setSystemTime(now);

			const minutesAgo = new Date('2023-01-01T11:55:00Z');
			const daysAgo = new Date('2022-12-30T12:00:00Z');
			const monthsAgo = new Date('2022-11-01T12:00:00Z');

			expect(getRelativeDateString(minutesAgo)).toBe('5 minutes ago');
			expect(getRelativeDateString(daysAgo)).toBe('2 days ago');
			expect(getRelativeDateString(monthsAgo)).toBe('2 months ago');
		});
	});
});

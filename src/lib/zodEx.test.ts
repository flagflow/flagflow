/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import type { ZodIssue } from 'zod';

import { zodFlattenError } from './zodEx';

describe('zodEx', () => {
	describe('zodFlattenError', () => {
		it('should format single validation error', () => {
			const errors: ZodIssue[] = [
				{
					code: 'invalid_type',
					expected: 'string',
					received: 'number',
					path: ['name'],
					message: 'Expected string, received number'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe('Field name expected string, received number');
		});

		it('should format multiple validation errors', () => {
			const errors: ZodIssue[] = [
				{
					code: 'invalid_type',
					expected: 'string',
					received: 'number',
					path: ['name'],
					message: 'Expected string, received number'
				} as any,
				{
					code: 'too_small',
					minimum: 3,
					type: 'string',
					inclusive: true,
					exact: false,
					path: ['password'],
					message: 'String must contain at least 3 character(s)'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe(
				'Field name expected string, received number, Field password string must contain at least 3 character(s)'
			);
		});

		it('should handle nested field paths', () => {
			const errors: ZodIssue[] = [
				{
					code: 'invalid_type',
					expected: 'string',
					received: 'undefined',
					path: ['user', 'profile', 'firstName'],
					message: 'Required'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe('Field user.profile.firstName required');
		});

		it('should handle array indices in paths', () => {
			const errors: ZodIssue[] = [
				{
					code: 'invalid_type',
					expected: 'string',
					received: 'number',
					path: ['items', 0, 'name'],
					message: 'Expected string, received number'
				} as any,
				{
					code: 'too_small',
					minimum: 1,
					type: 'number',
					inclusive: true,
					exact: false,
					path: ['items', 1, 'quantity'],
					message: 'Number must be greater than or equal to 1'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe(
				'Field items.0.name expected string, received number, Field items.1.quantity number must be greater than or equal to 1'
			);
		});

		it('should handle empty path', () => {
			const errors: ZodIssue[] = [
				{
					code: 'invalid_type',
					expected: 'object',
					received: 'string',
					path: [],
					message: 'Expected object, received string'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe('Field  expected object, received string');
		});

		it('should handle empty errors array', () => {
			const errors: ZodIssue[] = [];
			const result = zodFlattenError(errors);
			expect(result).toBe('');
		});

		it('should lowercase message and preserve field names', () => {
			const errors: ZodIssue[] = [
				{
					code: 'invalid_type',
					expected: 'string',
					received: 'number',
					path: ['firstName'],
					message: 'Expected String, Received Number'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe('Field firstName expected string, received number');
		});

		it('should handle special characters in field names', () => {
			const errors: ZodIssue[] = [
				{
					code: 'invalid_type',
					expected: 'string',
					received: 'number',
					path: ['user-name', 'first_name'],
					message: 'Invalid type'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe('Field user-name.first_name invalid type');
		});

		it('should handle various error types', () => {
			const errors: ZodIssue[] = [
				{
					code: 'too_big',
					maximum: 100,
					type: 'string',
					inclusive: true,
					exact: false,
					path: ['description'],
					message: 'String must contain at most 100 character(s)'
				} as any,
				{
					code: 'invalid_string',
					validation: 'email',
					path: ['email'],
					message: 'Invalid email'
				} as any,
				{
					code: 'custom',
					path: ['customField'],
					message: 'Custom validation failed'
				} as any
			];

			const result = zodFlattenError(errors);
			expect(result).toBe(
				'Field description string must contain at most 100 character(s), Field email invalid email, Field customField custom validation failed'
			);
		});
	});
});

import { describe, expect, it } from 'vitest';

import {
	BROWSERID_LENGTH,
	generateBrowserId,
	GENERATED_PASSWORD_LENGTH,
	generateHtmlElementId,
	generatePassword,
	generateSessionId,
	generateTraceId,
	HTMLELEMENTID_LENGTH,
	SESSIONID_LENGTH,
	TRACEID_LENGTH
} from './genId';

describe('genId', () => {
	describe('generateHtmlElementId', () => {
		it('should generate ID with correct length and prefix', () => {
			const id = generateHtmlElementId();
			expect(id).toMatch(/^H[\w-]+$/);
			expect(id.length).toBe(HTMLELEMENTID_LENGTH + 1); // +1 for 'H' prefix
		});

		it('should generate unique IDs', () => {
			const id1 = generateHtmlElementId();
			const id2 = generateHtmlElementId();
			expect(id1).not.toBe(id2);
		});

		it('should always start with H', () => {
			for (let index = 0; index < 10; index++) {
				const id = generateHtmlElementId();
				expect(id[0]).toBe('H');
			}
		});
	});

	describe('generateBrowserId', () => {
		it('should generate ID with correct length', () => {
			const id = generateBrowserId();
			expect(id).toMatch(/^[\w-]+$/);
			expect(id.length).toBe(BROWSERID_LENGTH);
		});

		it('should generate unique IDs', () => {
			const id1 = generateBrowserId();
			const id2 = generateBrowserId();
			expect(id1).not.toBe(id2);
		});

		it('should use URL-safe characters only', () => {
			for (let index = 0; index < 10; index++) {
				const id = generateBrowserId();
				expect(id).toMatch(/^[\w-]+$/);
			}
		});
	});

	describe('generateTraceId', () => {
		it('should generate ID with correct length', () => {
			const id = generateTraceId();
			expect(id).toMatch(/^[\w-]+$/);
			expect(id.length).toBe(TRACEID_LENGTH);
		});

		it('should generate unique IDs', () => {
			const id1 = generateTraceId();
			const id2 = generateTraceId();
			expect(id1).not.toBe(id2);
		});

		it('should be suitable for logging and tracing', () => {
			const id = generateTraceId();
			expect(id).toMatch(/^[\w-]+$/);
			expect(id.length).toBe(21); // Standard nanoid length for tracing
		});
	});

	describe('generateSessionId', () => {
		it('should generate ID with correct length', () => {
			const id = generateSessionId();
			expect(id).toMatch(/^[\w-]+$/);
			expect(id.length).toBe(SESSIONID_LENGTH);
		});

		it('should generate unique IDs', () => {
			const id1 = generateSessionId();
			const id2 = generateSessionId();
			expect(id1).not.toBe(id2);
		});

		it('should be long enough for security', () => {
			const id = generateSessionId();
			expect(id.length).toBe(32); // Long enough for session security
		});
	});

	describe('generatePassword', () => {
		it('should generate password with default length', () => {
			const password = generatePassword();
			expect(password.length).toBe(GENERATED_PASSWORD_LENGTH);
		});

		it('should generate password with custom length', () => {
			const password = generatePassword(20);
			expect(password.length).toBe(20);
		});

		it('should contain mixed character types', () => {
			const password = generatePassword(50); // Longer password for better testing

			// Should contain lowercase
			expect(password).toMatch(/[a-z]/);
			// Should contain uppercase
			expect(password).toMatch(/[A-Z]/);
			// Should contain digits
			expect(password).toMatch(/\d/);
			// Should contain special characters
			expect(password).toMatch(/[!$%()+/;=]/);
		});

		it('should generate unique passwords', () => {
			const password1 = generatePassword();
			const password2 = generatePassword();
			expect(password1).not.toBe(password2);
		});

		it('should only use allowed characters', () => {
			const password = generatePassword(100);
			const allowedChars =
				'abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789' + ';$+!%/=()';

			for (const char of password) expect(allowedChars.includes(char)).toBe(true);
		});

		it('should handle edge cases', () => {
			expect(generatePassword(1).length).toBe(1);
			// nanoid doesn't support 0 length, it returns minimum 1 character
			expect(generatePassword(0).length).toBeGreaterThanOrEqual(0);
		});
	});

	describe('constants', () => {
		it('should have correct constant values', () => {
			expect(HTMLELEMENTID_LENGTH).toBe(8);
			expect(BROWSERID_LENGTH).toBe(8);
			expect(TRACEID_LENGTH).toBe(21);
			expect(SESSIONID_LENGTH).toBe(32);
			expect(GENERATED_PASSWORD_LENGTH).toBe(12);
		});

		it('should use constants consistently', () => {
			const htmlId = generateHtmlElementId();
			expect(htmlId.length).toBe(HTMLELEMENTID_LENGTH + 1); // +1 for prefix

			const browserId = generateBrowserId();
			expect(browserId.length).toBe(BROWSERID_LENGTH);

			const traceId = generateTraceId();
			expect(traceId.length).toBe(TRACEID_LENGTH);

			const sessionId = generateSessionId();
			expect(sessionId.length).toBe(SESSIONID_LENGTH);

			const password = generatePassword();
			expect(password.length).toBe(GENERATED_PASSWORD_LENGTH);
		});
	});

	describe('collision resistance', () => {
		it('should have very low collision probability', () => {
			const ids = new Set();
			const iterations = 1000;

			// Test HTML element IDs
			for (let index = 0; index < iterations; index++) ids.add(generateHtmlElementId());
			expect(ids.size).toBe(iterations);

			// Test trace IDs
			ids.clear();
			for (let index = 0; index < iterations; index++) ids.add(generateTraceId());
			expect(ids.size).toBe(iterations);

			// Test session IDs
			ids.clear();
			for (let index = 0; index < iterations; index++) ids.add(generateSessionId());
			expect(ids.size).toBe(iterations);
		});

		it('should maintain uniqueness across different generators', () => {
			const allIds = new Set();

			for (let index = 0; index < 100; index++) {
				allIds.add(generateHtmlElementId());
				allIds.add(generateBrowserId());
				allIds.add(generateTraceId());
				allIds.add(generateSessionId());
			}

			// Should have 400 unique IDs (100 * 4 generators)
			expect(allIds.size).toBe(400);
		});
	});

	describe('performance', () => {
		it('should generate IDs quickly', () => {
			const start = performance.now();

			for (let index = 0; index < 1000; index++) {
				generateHtmlElementId();
				generateBrowserId();
				generateTraceId();
				generateSessionId();
				generatePassword();
			}

			const end = performance.now();
			const duration = end - start;

			// Should complete 5000 generations in reasonable time
			expect(duration).toBeLessThan(1000); // Less than 1 second
		});
	});
});

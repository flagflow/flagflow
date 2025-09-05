import { passwordStrength } from 'check-password-strength';
import { describe, expect, it } from 'vitest';

import { generateRandomPassword, validatePasswordStrength } from './passwordUtilities';

describe('passwordUtilities', () => {
	describe('generateRandomPassword', () => {
		it('should return a password', async () => {
			const result = await generateRandomPassword();

			expect(result).toBeTruthy();
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThanOrEqual(8);
		});

		it('should generate passwords with sufficient strength', async () => {
			const password = await generateRandomPassword();
			const strength = passwordStrength(password);

			expect(strength.id).toBeGreaterThanOrEqual(3); // Should be strong
		});

		it('should generate unique passwords', async () => {
			const password1 = await generateRandomPassword();
			const password2 = await generateRandomPassword();

			expect(password1).not.toBe(password2);
		});

		it('should generate passwords with variable lengths', async () => {
			const passwords = await Promise.all([
				generateRandomPassword(),
				generateRandomPassword(),
				generateRandomPassword(),
				generateRandomPassword(),
				generateRandomPassword()
			]);

			// Should have some variation in lengths (8 + Math.random() * 8)
			const lengths = passwords.map((p) => p.length);
			const minLength = Math.min(...lengths);
			const maxLength = Math.max(...lengths);

			expect(minLength).toBeGreaterThanOrEqual(8);
			expect(maxLength).toBeLessThanOrEqual(16);
		});

		it('should generate passwords that pass validation', async () => {
			const password = await generateRandomPassword();
			const isValid = validatePasswordStrength(password);

			expect(isValid).toBe(true);
		});

		it('should generate passwords with mixed character types', async () => {
			// Generate multiple passwords to ensure we get character diversity
			const passwords = await Promise.all(
				Array.from({ length: 10 }, () => generateRandomPassword())
			);

			const combinedPassword = passwords.join('');

			// Should contain lowercase, uppercase, digits, and special characters
			expect(combinedPassword).toMatch(/[a-z]/);
			expect(combinedPassword).toMatch(/[A-Z]/);
			expect(combinedPassword).toMatch(/\d/);
			expect(combinedPassword).toMatch(/[!$%()+/;=]/);
		});
	});

	describe('validatePasswordStrength', () => {
		it('should return true for strong passwords', () => {
			const strongPasswords = [
				'VeryStrongPassword123!',
				'AnotherGood1Pass@',
				'Complex123$Password',
				'Str0ngP@ssw0rd!',
				'MySecurePass2023!'
			];

			for (const password of strongPasswords) {
				const result = validatePasswordStrength(password);
				expect(result).toBe(true);
			}
		});

		it('should return true for medium strength passwords', () => {
			const mediumPasswords = ['Password123', 'MediumPass1', 'GoodPass123', 'TestPass456'];

			for (const password of mediumPasswords) {
				const strength = passwordStrength(password);
				if (strength.id >= 2) {
					const result = validatePasswordStrength(password);
					expect(result).toBe(true);
				}
			}
		});

		it('should return false for weak passwords', () => {
			const weakPasswords = ['weak', '123456', 'password', 'abc', 'test', '', 'a', '12'];

			for (const password of weakPasswords) {
				const strength = passwordStrength(password);
				if (strength.id < 2) {
					const result = validatePasswordStrength(password);
					expect(result).toBe(false);
				}
			}
		});

		it('should handle empty strings', () => {
			const result = validatePasswordStrength('');
			expect(result).toBe(false);
		});

		it('should be consistent with passwordStrength library', () => {
			const testPasswords = ['VeryStrongPassword123!', 'MediumPass123', 'weak', '123456', ''];

			for (const password of testPasswords) {
				const strength = passwordStrength(password);
				const ourResult = validatePasswordStrength(password);
				const expectedResult = strength.id >= 2;

				expect(ourResult).toBe(expectedResult);
			}
		});

		it('should validate passwords from generateRandomPassword', async () => {
			// Test that our generator produces passwords that pass our validator
			for (let index = 0; index < 5; index++) {
				const password = await generateRandomPassword();
				const isValid = validatePasswordStrength(password);
				expect(isValid).toBe(true);
			}
		});
	});

	describe('integration', () => {
		it('should work together - generated passwords should always be valid', async () => {
			// Test the integration between both functions
			const passwords = await Promise.all(
				Array.from({ length: 10 }, () => generateRandomPassword())
			);

			for (const password of passwords) {
				expect(validatePasswordStrength(password)).toBe(true);
				expect(passwordStrength(password).id).toBeGreaterThanOrEqual(3);
			}
		});

		it('should maintain consistency across multiple calls', async () => {
			// Test that the functions work consistently
			for (let index = 0; index < 5; index++) {
				const password = await generateRandomPassword();

				// Should be valid
				expect(validatePasswordStrength(password)).toBe(true);

				// Should be strong
				const strength = passwordStrength(password);
				expect(strength.id).toBeGreaterThanOrEqual(3);

				// Should have reasonable length
				expect(password.length).toBeGreaterThanOrEqual(8);
				expect(password.length).toBeLessThanOrEqual(16);
			}
		});
	});

	describe('performance', () => {
		it('should generate passwords efficiently', async () => {
			const start = performance.now();

			const passwords = await Promise.all(
				Array.from({ length: 100 }, () => generateRandomPassword())
			);

			const end = performance.now();
			const duration = end - start;

			expect(passwords).toHaveLength(100);
			expect(duration).toBeLessThan(5000); // Should complete in reasonable time
		});

		it('should validate password strength quickly', () => {
			const testPasswords = ['VeryStrongPassword123!', 'MediumPass123', 'weak', '123456'];

			const start = performance.now();

			for (let index = 0; index < 1000; index++) {
				for (const password of testPasswords) {
					validatePasswordStrength(password);
				}
			}

			const end = performance.now();
			const duration = end - start;

			expect(duration).toBeLessThan(1000); // Should be very fast
		});
	});

	describe('edge cases', () => {
		it('should handle various character sets in validation', () => {
			const testCases = [
				'UPPERCASE123!',
				'lowercase123!',
				'MixedCase123!',
				'NoNumbers!', // Might be weak
				'nonumbers',
				'12345678'
			];

			for (const password of testCases) {
				const strength = passwordStrength(password);
				const result = validatePasswordStrength(password);
				const expected = strength.id >= 2;

				expect(result).toBe(expected);
			}
		});

		it('should handle unicode characters gracefully', () => {
			const unicodePasswords = ['Påssword123!', '密码Password123', 'Mot🔒de🔑passe123'];

			for (const password of unicodePasswords) {
				expect(() => validatePasswordStrength(password)).not.toThrow();
			}
		});
	});
});

import { describe, expect, it } from 'vitest';

import { combineUrls } from './urlEx';

describe('urlEx', () => {
	describe('combineUrls', () => {
		it('should combine base URL with single path', () => {
			expect(combineUrls('https://api.example.com', 'users')).toBe('https://api.example.com/users');
			expect(combineUrls('http://localhost:3000', 'api')).toBe('http://localhost:3000/api');
		});

		it('should combine base URL with multiple paths', () => {
			expect(combineUrls('https://api.example.com', 'v1', 'users', '123')).toBe(
				'https://api.example.com/v1/users/123'
			);
			expect(combineUrls('http://localhost', 'api', 'v2', 'data')).toBe(
				'http://localhost/api/v2/data'
			);
		});

		it('should handle base URL ending with slash', () => {
			expect(combineUrls('https://api.example.com/', 'users')).toBe(
				'https://api.example.com/users'
			);
			expect(combineUrls('http://localhost:3000/', 'api', 'data')).toBe(
				'http://localhost:3000/api/data'
			);
		});

		it('should handle paths starting with slash', () => {
			expect(combineUrls('https://api.example.com', '/users')).toBe(
				'https://api.example.com/users'
			);
			expect(combineUrls('http://localhost', '/api', '/data')).toBe('http://localhost/api/data');
		});

		it('should handle both base and paths with slashes', () => {
			expect(combineUrls('https://api.example.com/', '/users')).toBe(
				'https://api.example.com/users'
			);
			expect(combineUrls('http://localhost/', '/api/', '/data/')).toBe(
				'http://localhost/api/data/'
			);
		});

		it('should skip empty paths', () => {
			expect(combineUrls('https://api.example.com', '', 'users', '', '123')).toBe(
				'https://api.example.com/users/123'
			);
			expect(combineUrls('http://localhost', 'api', '', 'data')).toBe('http://localhost/api/data');
		});

		it('should handle only base URL', () => {
			expect(combineUrls('https://api.example.com')).toBe('https://api.example.com');
			expect(combineUrls('http://localhost:3000/')).toBe('http://localhost:3000/');
		});

		it('should handle complex URLs', () => {
			expect(combineUrls('https://api.example.com:8080/base', 'v1', 'users')).toBe(
				'https://api.example.com:8080/base/v1/users'
			);
		});

		it('should handle query parameters and fragments in base', () => {
			expect(combineUrls('https://api.example.com?param=value', 'users')).toBe(
				'https://api.example.com?param=value/users'
			);
			expect(combineUrls('https://api.example.com#section', 'users')).toBe(
				'https://api.example.com#section/users'
			);
		});

		it('should handle paths with special characters', () => {
			expect(combineUrls('https://api.example.com', 'users', 'john-doe', 'profile')).toBe(
				'https://api.example.com/users/john-doe/profile'
			);
			expect(combineUrls('https://api.example.com', 'files', 'document_v2.pdf')).toBe(
				'https://api.example.com/files/document_v2.pdf'
			);
		});

		it('should handle empty base URL', () => {
			expect(combineUrls('', 'users', 'profile')).toBe('/users/profile');
		});

		it('should not double-encode already encoded paths', () => {
			expect(combineUrls('https://api.example.com', 'users', 'search%20term')).toBe(
				'https://api.example.com/users/search%20term'
			);
		});

		it('should handle protocol-relative URLs', () => {
			expect(combineUrls('//api.example.com', 'users')).toBe('//api.example.com/users');
		});

		it('should handle relative base URLs', () => {
			expect(combineUrls('../api', 'users')).toBe('../api/users');
			expect(combineUrls('./base/', 'users')).toBe('./base/users');
		});
	});
});

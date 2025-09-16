import { describe, expect, it } from 'vitest';

import { combineUrls, safeUrl } from './urlEx';

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

	describe('safeUrl', () => {
		it('should return URL object for valid URLs', () => {
			const url1 = safeUrl('https://api.example.com');
			expect(url1).toBeInstanceOf(URL);
			expect(url1?.href).toBe('https://api.example.com/');

			const url2 = safeUrl('http://localhost:3000/api');
			expect(url2).toBeInstanceOf(URL);
			expect(url2?.href).toBe('http://localhost:3000/api');
		});

		it('should return URL object for valid URLs with paths and query parameters', () => {
			const url = safeUrl('https://api.example.com/users?page=1&limit=10');
			expect(url).toBeInstanceOf(URL);
			expect(url?.pathname).toBe('/users');
			expect(url?.search).toBe('?page=1&limit=10');
		});

		it('should return URL object for valid URLs with fragments', () => {
			const url = safeUrl('https://example.com/docs#section1');
			expect(url).toBeInstanceOf(URL);
			expect(url?.hash).toBe('#section1');
		});

		it('should return undefined for invalid URLs', () => {
			expect(safeUrl('not-a-url')).toBeUndefined();
			expect(safeUrl('http://')).toBeUndefined();
			expect(safeUrl('://missing-protocol')).toBeUndefined();
			expect(safeUrl('')).toBeUndefined();
		});

		it('should return undefined for malformed URLs', () => {
			expect(safeUrl('http://[invalid')).toBeUndefined();
			expect(safeUrl('ftp://user@host:99999999999999999999')).toBeUndefined();
			expect(safeUrl('http://192.168.1.256')).toBeUndefined();
		});

		it('should handle special characters in URLs', () => {
			const url = safeUrl('https://example.com/path%20with%20spaces');
			expect(url).toBeInstanceOf(URL);
			expect(url?.pathname).toBe('/path%20with%20spaces');
		});

		it('should handle data URLs', () => {
			const url = safeUrl('data:text/plain;base64,SGVsbG8gV29ybGQ=');
			expect(url).toBeInstanceOf(URL);
			expect(url?.protocol).toBe('data:');
		});

		it('should handle file URLs', () => {
			const url = safeUrl('file:///path/to/file');
			expect(url).toBeInstanceOf(URL);
			expect(url?.protocol).toBe('file:');
		});

		it('should handle URLs with unusual but valid protocols', () => {
			const url = safeUrl('ftp://ftp.example.com/file.txt');
			expect(url).toBeInstanceOf(URL);
			expect(url?.protocol).toBe('ftp:');
		});

		it('should handle localhost URLs', () => {
			const url = safeUrl('http://localhost:8080');
			expect(url).toBeInstanceOf(URL);
			expect(url?.hostname).toBe('localhost');
			expect(url?.port).toBe('8080');
		});

		it('should handle IPv4 addresses', () => {
			const url = safeUrl('http://192.168.1.1:3000');
			expect(url).toBeInstanceOf(URL);
			expect(url?.hostname).toBe('192.168.1.1');
			expect(url?.port).toBe('3000');
		});

		it('should handle IPv6 addresses', () => {
			const url = safeUrl('http://[::1]:8080');
			expect(url).toBeInstanceOf(URL);
			expect(url?.hostname).toBe('[::1]');
			expect(url?.port).toBe('8080');
		});

		it('should return undefined for null and undefined inputs', () => {
			expect(safeUrl(undefined as unknown as string)).toBeUndefined();
			expect(safeUrl('' as string)).toBeUndefined();
		});
	});
});

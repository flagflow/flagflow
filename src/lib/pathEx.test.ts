import { describe, expect, it } from 'vitest';

import { basename, dirname, extname, join, normalize, relative, resolve } from './pathEx';

describe('pathEx', () => {
	describe('extname', () => {
		it('should return file extension', () => {
			expect(extname('file.txt')).toBe('.txt');
			expect(extname('document.pdf')).toBe('.pdf');
			expect(extname('archive.tar.gz')).toBe('.gz');
		});

		it('should handle files without extension', () => {
			expect(extname('filename')).toBe('');
			expect(extname('README')).toBe('');
		});

		it('should handle hidden files', () => {
			expect(extname('.gitignore')).toBe('.gitignore'); // Returns from last dot
			expect(extname('.env.local')).toBe('.local');
		});

		it('should handle empty string', () => {
			expect(extname('')).toBe('');
		});
	});

	describe('basename', () => {
		it('should return filename from path', () => {
			expect(basename('/path/to/file.txt')).toBe('file.txt');
			expect(basename('folder/document.pdf')).toBe('document.pdf');
			expect(basename('filename.js')).toBe('filename.js');
		});

		it('should handle paths ending with slash', () => {
			expect(basename('/path/to/folder/')).toBe('');
		});

		it('should handle single filename', () => {
			expect(basename('file.txt')).toBe('file.txt');
		});

		it('should handle empty string', () => {
			expect(basename('')).toBe('');
		});
	});

	describe('dirname', () => {
		it('should return directory path', () => {
			expect(dirname('/path/to/file.txt')).toBe('/path/to');
			expect(dirname('folder/document.pdf')).toBe('folder');
		});

		it('should handle root directory', () => {
			expect(dirname('/file.txt')).toBe('');
		});

		it('should handle no directory', () => {
			expect(dirname('file.txt')).toBe('');
		});

		it('should handle nested directories', () => {
			expect(dirname('/very/deep/nested/path/file.txt')).toBe('/very/deep/nested/path');
		});

		it('should handle empty string', () => {
			expect(dirname('')).toBe('');
		});
	});

	describe('join', () => {
		it('should join paths with delimiter', () => {
			expect(join('/', 'path', 'to', 'file')).toBe('path/to/file');
			expect(join('-', 'a', 'b', 'c')).toBe('a-b-c');
		});

		it('should handle empty parts', () => {
			expect(join('/', 'path', '', 'file')).toBe('path//file');
		});

		it('should handle single part', () => {
			expect(join('/', 'path')).toBe('path');
		});

		it('should handle no parts', () => {
			expect(join('/')).toBe('');
		});
	});

	describe('normalize', () => {
		it('should normalize multiple consecutive delimiters', () => {
			expect(normalize('path//to///file')).toBe('path/to/file');
			expect(normalize('a--b---c', '-')).toBe('a-b-c');
		});

		it('should handle single delimiters', () => {
			expect(normalize('path/to/file')).toBe('path/to/file');
		});

		it('should handle empty string', () => {
			expect(normalize('')).toBe('');
		});

		it('should use default delimiter', () => {
			expect(normalize('path//to///file')).toBe('path/to/file');
		});

		it('should handle custom delimiter', () => {
			expect(normalize(String.raw`path\\to\\\file`, '\\\\')).toBe(String.raw`path\\to\\file`);
		});
	});

	describe('resolve', () => {
		it('should resolve relative paths', () => {
			expect(resolve('path/to/../file')).toBe('path/file');
			expect(resolve('path/./to/file')).toBe('path/to/file');
			expect(resolve('path/../to/../../file')).toBe('file');
		});

		it('should handle multiple dot-dot references', () => {
			expect(resolve('a/b/c/../../d')).toBe('a/d');
			expect(resolve('a/../b/../c')).toBe('c');
		});

		it('should handle current directory references', () => {
			expect(resolve('a/./b/./c')).toBe('a/b/c');
		});

		it('should handle going beyond root', () => {
			expect(resolve('../../../file')).toBe('file');
		});

		it('should handle custom delimiter', () => {
			expect(resolve(String.raw`path\\to\\..\\file`, '\\\\')).toBe(String.raw`path\\file`);
		});

		it('should handle empty path', () => {
			expect(resolve('')).toBe('');
		});
	});

	describe('relative', () => {
		it('should calculate relative path between directories', () => {
			expect(relative('a/b', 'a/c')).toBe('../c');
			expect(relative('a/b/c', 'a/d/e')).toBe('../../d/e');
		});

		it('should handle same directory', () => {
			expect(relative('a/b', 'a/b')).toBe('/');
		});

		it('should handle nested to parent', () => {
			expect(relative('a/b/c', 'a')).toBe('../../');
		});

		it('should handle parent to nested', () => {
			expect(relative('a', 'a/b/c')).toBe('/b/c');
		});

		it('should handle completely different paths', () => {
			expect(relative('x/y', 'a/b')).toBe('../../a/b');
		});

		it('should use custom delimiter', () => {
			expect(relative(String.raw`a\\b`, String.raw`a\\c`, '\\\\')).toBe(String.raw`..\\c`);
		});

		it('should handle empty paths', () => {
			expect(relative('', 'a')).toBe('../a');
			expect(relative('a', '')).toBe('../');
		});
	});
});

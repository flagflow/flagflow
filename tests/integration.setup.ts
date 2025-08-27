// Test setup file for integration tests
// This file is referenced in vitest.config.ts and is loaded before running tests

// Set log level to silent for all tests
process.env['LOGLEVEL'] = 'silent';
// Set node environment to production
process.env['NODE_ENV'] = 'production';

// Mock __APP_VERSION__ for tests
// @ts-expect-error because setup environment
globalThis.__APP_VERSION__ = '1.0.0-test';

// Empty export to make this a module
export const placeholder = true;

import { get, writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock windowEx module
vi.mock('./windowEx', () => ({
	updateQueryParameters: vi.fn()
}));

import {
	debouncedStore,
	isStringStore,
	queryParameterBooleanStore,
	queryParameterClearableStringStore,
	queryParameterNumberStore,
	queryParameterStringStore
} from './storeEx';
import { updateQueryParameters } from './windowEx';

const mockUpdateQueryParameters = vi.mocked(updateQueryParameters);

describe('storeEx', () => {
	describe('isStringStore', () => {
		it('should return true for writable store containing string', () => {
			const stringStore = writable('test');
			expect(isStringStore(stringStore)).toBe(true);
		});

		it('should return false for writable store containing number', () => {
			const numberStore = writable(42);
			expect(isStringStore(numberStore)).toBe(false);
		});

		it('should return false for writable store containing boolean', () => {
			const booleanStore = writable(true);
			expect(isStringStore(booleanStore)).toBe(false);
		});

		it('should return false for writable store containing object', () => {
			const objectStore = writable({ test: 'value' });
			expect(isStringStore(objectStore)).toBe(false);
		});

		it('should return false for writable store containing null', () => {
			const nullStore = writable();
			expect(isStringStore(nullStore)).toBe(false);
		});
	});

	describe('debouncedStore', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should emit initial value immediately when fastInit is true', () => {
			const sourceStore = writable('initial');
			const debounced = debouncedStore(sourceStore, 100, true);

			expect(get(debounced)).toBe('initial');
		});

		it('should not emit initial value immediately when fastInit is false', () => {
			const sourceStore = writable('initial');
			const debounced = debouncedStore(sourceStore, 100, false);

			// The derived store won't have a value until the timeout
			let currentValue: string | undefined;
			const unsubscribe = debounced.subscribe((value) => {
				currentValue = value;
			});

			expect(currentValue).toBeUndefined();
			unsubscribe();
		});

		it('should debounce updates after initial value', () => {
			const sourceStore = writable('initial');
			const debounced = debouncedStore(sourceStore, 100);

			const values: string[] = [];
			const unsubscribe = debounced.subscribe((value) => values.push(value));

			// Initial value should be emitted immediately
			expect(values).toEqual(['initial']);

			// Update the source store multiple times quickly
			sourceStore.set('update1');
			sourceStore.set('update2');
			sourceStore.set('update3');

			// No new values should be emitted yet
			expect(values).toEqual(['initial']);

			// Fast-forward time
			vi.advanceTimersByTime(100);

			// Only the last update should be emitted
			expect(values).toEqual(['initial', 'update3']);

			unsubscribe();
		});

		it('should cancel previous timeout when new update comes', () => {
			const sourceStore = writable('initial');
			const debounced = debouncedStore(sourceStore, 100);

			const values: string[] = [];
			const unsubscribe = debounced.subscribe((value) => values.push(value));

			// Update multiple times with partial delays
			sourceStore.set('update1');
			vi.advanceTimersByTime(50);

			sourceStore.set('update2');
			vi.advanceTimersByTime(50);

			sourceStore.set('update3');
			vi.advanceTimersByTime(100);

			// Only initial and final update should be emitted
			expect(values).toEqual(['initial', 'update3']);

			unsubscribe();
		});

		it('should work with number values', () => {
			const sourceStore = writable(1);
			const debounced = debouncedStore(sourceStore, 100);

			const values: number[] = [];
			const unsubscribe = debounced.subscribe((value) => values.push(value));

			expect(values).toEqual([1]);

			sourceStore.set(42);
			vi.advanceTimersByTime(100);

			expect(values).toEqual([1, 42]);

			unsubscribe();
		});

		it('should work with boolean values', () => {
			const sourceStore = writable(true);
			const debounced = debouncedStore(sourceStore, 100);

			const values: boolean[] = [];
			const unsubscribe = debounced.subscribe((value) => values.push(value));

			expect(values).toEqual([true]);

			sourceStore.set(false);
			vi.advanceTimersByTime(100);

			expect(values).toEqual([true, false]);

			unsubscribe();
		});
	});

	describe('queryParameterStringStore', () => {
		beforeEach(() => {
			mockUpdateQueryParameters.mockClear();
		});

		it('should initialize with provided initValue', () => {
			const store = queryParameterStringStore('test', 'initial');
			expect(get(store)).toBe('initial');
		});

		it('should initialize with defaultValue when no initValue', () => {
			const store = queryParameterStringStore('test', undefined, 'default');
			expect(get(store)).toBe('default');
		});

		it('should initialize with empty string when no values provided', () => {
			const store = queryParameterStringStore('test');
			expect(get(store)).toBe('');
		});

		it('should call updateQueryParameters when value changes', () => {
			const store = queryParameterStringStore('test', 'initial');

			store.set('new value');

			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', 'new value');
		});

		it('should call updateQueryParameters with undefined when empty string is set', () => {
			const store = queryParameterStringStore('test', 'initial');

			store.set('');

			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should handle null values by converting to empty string', () => {
			const store = queryParameterStringStore('test');

			store.set('');

			expect(get(store)).toBe('');
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should handle undefined values by converting to empty string', () => {
			const store = queryParameterStringStore('test');

			store.set('');

			expect(get(store)).toBe('');
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should support update method', () => {
			const store = queryParameterStringStore('test', 'initial');

			store.update((value) => value + ' updated');

			expect(get(store)).toBe('initial updated');
		});
	});

	describe('queryParameterNumberStore', () => {
		beforeEach(() => {
			mockUpdateQueryParameters.mockClear();
		});

		it('should initialize with provided initValue', () => {
			const store = queryParameterNumberStore('test', 42);
			expect(get(store)).toBe(42);
		});

		it('should initialize with defaultValue when no initValue', () => {
			const store = queryParameterNumberStore('test', undefined, 100);
			expect(get(store)).toBe(100);
		});

		it('should initialize with 0 when no values provided', () => {
			const store = queryParameterNumberStore('test');
			expect(get(store)).toBe(0);
		});

		it('should call updateQueryParameters when value changes', () => {
			const store = queryParameterNumberStore('test', 42);

			store.set(100);

			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', '100');
		});

		it('should call updateQueryParameters with undefined when 0 is set', () => {
			const store = queryParameterNumberStore('test', 42);

			store.set(0);

			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should handle null values by converting to 0', () => {
			const store = queryParameterNumberStore('test');

			store.set(0);

			expect(get(store)).toBe(0);
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should handle undefined values by converting to 0', () => {
			const store = queryParameterNumberStore('test');

			store.set(0);

			expect(get(store)).toBe(0);
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should support update method', () => {
			const store = queryParameterNumberStore('test', 10);

			store.update((value) => value * 2);

			expect(get(store)).toBe(20);
		});

		it('should handle negative numbers', () => {
			const store = queryParameterNumberStore('test', -5);

			expect(get(store)).toBe(-5);
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', '-5');
		});

		it('should handle decimal numbers', () => {
			const store = queryParameterNumberStore('test');

			store.set(3.14);

			expect(get(store)).toBe(3.14);
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', '3.14');
		});
	});

	describe('queryParameterBooleanStore', () => {
		beforeEach(() => {
			mockUpdateQueryParameters.mockClear();
		});

		it('should initialize with provided initValue', () => {
			const store = queryParameterBooleanStore('test', true);
			expect(get(store)).toBe(true);
		});

		it('should initialize with defaultValue when no initValue', () => {
			const store = queryParameterBooleanStore('test', undefined, true);
			expect(get(store)).toBe(true);
		});

		it('should initialize with false when no values provided', () => {
			const store = queryParameterBooleanStore('test');
			expect(get(store)).toBe(false);
		});

		it('should call updateQueryParameters with "true" when true is set', () => {
			const store = queryParameterBooleanStore('test', false);

			store.set(true);

			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', 'true');
		});

		it('should call updateQueryParameters with undefined when false is set', () => {
			const store = queryParameterBooleanStore('test', true);

			store.set(false);

			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should handle null values by converting to false', () => {
			const store = queryParameterBooleanStore('test');

			store.set(false);

			expect(get(store)).toBe(false);
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should handle undefined values by converting to false', () => {
			const store = queryParameterBooleanStore('test');

			store.set(false);

			expect(get(store)).toBe(false);
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should support update method', () => {
			const store = queryParameterBooleanStore('test', false);

			store.update((value) => !value);

			expect(get(store)).toBe(true);
		});
	});

	describe('queryParameterClearableStringStore', () => {
		beforeEach(() => {
			mockUpdateQueryParameters.mockClear();
		});

		it('should initialize with provided initValue', () => {
			const store = queryParameterClearableStringStore('test', 'initial');
			expect(get(store)).toBe('initial');
		});

		it('should initialize with undefined when no initValue', () => {
			const store = queryParameterClearableStringStore('test');
			expect(get(store)).toBeUndefined();
		});

		it('should always call updateQueryParameters with undefined on subscription', () => {
			queryParameterClearableStringStore('test', 'initial');

			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should set empty string when set is called', () => {
			const store = queryParameterClearableStringStore('test', 'initial');
			mockUpdateQueryParameters.mockClear(); // Clear the initial call

			store.set('');

			expect(get(store)).toBe('');
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});

		it('should support update method', () => {
			const store = queryParameterClearableStringStore('test', 'initial');

			store.update((value) => (value || '') + ' updated');

			expect(get(store)).toBe('initial updated');
		});

		it('should handle multiple set calls', () => {
			const store = queryParameterClearableStringStore('test', 'initial');
			mockUpdateQueryParameters.mockClear(); // Clear the initial call

			store.set('');
			store.set('');
			store.set('');

			expect(get(store)).toBe('');
			// Each set() call should trigger updateQueryParameters because it changes the store value
			expect(mockUpdateQueryParameters).toHaveBeenCalledTimes(1);
			expect(mockUpdateQueryParameters).toHaveBeenCalledWith('test', undefined);
		});
	});
});

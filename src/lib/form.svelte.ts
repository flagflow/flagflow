import { tick } from 'svelte';
import { derived, writable } from 'svelte/store';
import { z } from 'zod';

import { ChangeProxy, type ProxyChanged } from './proxy';
import type { StringKeys, TypeKeys } from './typeEx';
import { zodFlattenError } from './zodEx';

export type ValidityItem = { isError: boolean; message?: string };

type InputObject = Record<string, unknown>;

type Validator = { [S in string]: ValidityItem | Validator };
const allValid = (validator: Validator): boolean =>
	Object.values(validator).every((item) => ('isError' in item ? !item.isError : allValid(item)));

type Action<P extends object> =
	| ((parameters: P) => Promise<void> | void)
	| (() => Promise<void> | void);

type Actuators<T extends InputObject, V extends Validator> = {
	validator?: (source: T) => V;
	changed?: ProxyChanged<T>;
	submitted?: (error?: unknown) => void;
};

type Options = {
	clearErrorOnChange: boolean;
};
const defaultOptions: Options = {
	clearErrorOnChange: true
};

export class FormLogic<T extends InputObject, V extends Validator, P extends object> {
	private _stateObject = $state<T>({} as T);
	private _formData: T;

	private _stateIsValid = writable<V | undefined>();

	private _stateAllValid = derived(
		this._stateIsValid,
		// eslint-disable-next-line unicorn/consistent-function-scoping
		($stateIsValid) => !$stateIsValid || allValid($stateIsValid)
	);
	private _stateIsDirty = writable(false);
	private _stateInProgress = writable(false);
	private _stateError = writable<Error | undefined>();

	private _action: Action<P>;
	private _actuators?: Actuators<T, V> | undefined;

	private _formExecute = async (parameters: P) => {
		this._stateError.set(undefined);
		this._stateInProgress.set(true);
		try {
			await this._action(parameters);
			this._actuators?.submitted?.();
		} catch (error) {
			this._actuators?.submitted?.(error);
			this._stateError.set(error instanceof Error ? error : undefined);
		} finally {
			this._stateInProgress.set(false);
		}
	};

	constructor(init: T, action: Action<P>, actuators?: Actuators<T, V>, options?: Partial<Options>) {
		const usedOptions: Options = { ...defaultOptions, ...options };

		this._action = action;
		this._actuators = actuators;

		this._stateObject = init;
		this._formData = ChangeProxy(
			this._stateObject,
			(target: T, property: string, currentValue: unknown, oldValue: unknown) => {
				this._stateObject = target;
				if (usedOptions.clearErrorOnChange) this._stateError.set(undefined);
				this._stateIsDirty.set(true);
				if (actuators?.changed) actuators.changed(target, property, currentValue, oldValue);
				if (actuators?.validator)
					this._stateIsValid.set(
						actuators.validator ? actuators.validator(this._formData) : undefined
					);
			}
		);

		if (actuators?.validator)
			this._stateIsValid.set(actuators.validator ? actuators.validator(this._formData) : undefined);
	}

	get formData() {
		return this._formData;
	}

	get formExecute() {
		return this._formExecute;
	}

	get formState() {
		return {
			stateIsValid: this._stateIsValid,
			stateAllValid: this._stateAllValid,
			stateIsDirty: this._stateIsDirty,
			stateInProgress: this._stateInProgress,
			stateError: this._stateError
		};
	}
}

export class StringValidator {
	private s: string;
	private _error: ValidityItem = { isError: false };
	private updateError(message: string) {
		if (!this._error.isError) this._error = { isError: true, message };
	}
	constructor(input: string, ...prepares: ('trim' | 'normalize' | 'upper' | 'lower')[]) {
		this.s = input;
		if (prepares)
			for (const prepare of prepares)
				switch (prepare) {
					case 'trim':
						this.s = this.s.trim();
						break;
					case 'normalize':
						// eslint-disable-next-line unicorn/prefer-string-replace-all
						this.s = this.s.replace(/\s{2,}/g, ' ');
						break;
					case 'upper':
						this.s = this.s.toLocaleUpperCase();
						break;
					case 'lower':
						this.s = this.s.toLocaleLowerCase();
						break;
				}
	}

	public get error() {
		return this._error;
	}

	public required(): StringValidator {
		if (!this.s) this.updateError('Required');
		return this;
	}
	public noSpace(): StringValidator {
		if (this.s.includes(' ')) this.updateError('No space allowed');
		return this;
	}
	public maxLength(length: number): StringValidator {
		if (this.s.length > length) this.updateError(`Max length ${length}`);
		return this;
	}
	public uppercase(): StringValidator {
		if (this.s !== this.s.toLocaleUpperCase()) this.updateError('Uppercase only');
		return this;
	}
	public lowercase(): StringValidator {
		if (this.s !== this.s.toLocaleLowerCase()) this.updateError('Lowercase only');
		return this;
	}
	public email(): StringValidator {
		return this.zod(z.string().email(), 'Invalid email');
	}
	public url(): StringValidator {
		if (this.s)
			this.regexp(
				/^(https?:\/\/)?((([\w-]+\.)+[A-Za-z]{2,})|localhost)(:\d{1,5})?(\/.*)?(\?.*)?(#.*)?$/,
				'Invalid URL'
			);
		return this;
	}
	public startsWith(prefix: string | string[]): StringValidator {
		if (!Array.isArray(prefix)) prefix = [prefix];
		if (this.s && !prefix.some((p) => this.s.startsWith(p)))
			this.updateError(`Must starts with ${prefix.join(', ')}`);
		return this;
	}
	public regexp(regexp: RegExp, message?: string): StringValidator {
		if (this.s && !regexp.test(this.s)) this.updateError(message ?? 'Not allowed chars');
		return this;
	}
	public zod(schema: z.ZodTypeAny, message?: string): StringValidator {
		if (this.s) {
			const isValid = schema.safeParse(this.s);
			if (!isValid.success) this.updateError(message ?? zodFlattenError(isValid.error.errors));
		}
		return this;
	}
}

export class ArrayValidator<T> {
	private s: T[];
	private _error: ValidityItem = { isError: false };
	private updateError(message: string) {
		if (!this._error.isError) this._error = { isError: true, message };
	}
	constructor(input: T[]) {
		this.s = input;
	}

	public get error() {
		return this._error;
	}

	public min(length: number): ArrayValidator<T> {
		if (this.s.length < length) this.updateError(`Min item count ${length}`);
		return this;
	}
	public max(length: number): ArrayValidator<T> {
		if (this.s.length > length) this.updateError(`Max item count ${length}`);
		return this;
	}
	public required(): ArrayValidator<T> {
		return this.min(1);
	}
	public zod(schema: z.ZodTypeAny, message?: string): ArrayValidator<T> {
		if (this.s) {
			const isValid = schema.safeParse(this.s);
			if (!isValid.success) this.updateError(message ?? zodFlattenError(isValid.error.errors));
		}
		return this;
	}
}

export const convertToSelect = <T extends Record<string, unknown>, U extends string | number>(
	source: T[],
	valueField: TypeKeys<T, U>,
	nameField: StringKeys<T> | ((item: T) => string),
	nullable?: { value: U | null; name: string }
): { value: U | null; name: string }[] => {
	const data = source.map((s) => ({
		value: s[valueField] as U,
		name: typeof nameField === 'function' ? nameField(s) : (s[nameField] as string)
	}));
	return nullable ? [nullable, ...data] : data;
};

export const focusInputById = async (id: string) => {
	if (typeof document === 'undefined') return;

	await tick();
	const element = document.querySelector('#' + id);
	if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) element.focus();
};

export const focusFirstEmptyInputById = async (ids: string[], fallbackId = '') => {
	if (typeof document === 'undefined') return;

	await tick();
	for (const id of ids) {
		const element = document.querySelector('#' + id);
		if (element instanceof HTMLInputElement && !element.value) {
			element.focus();
			return;
		}
	}
	if (fallbackId) focusInputById(fallbackId);
};

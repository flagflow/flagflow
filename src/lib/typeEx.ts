export type ElementType<T> = T extends (infer U)[] ? U : never;

/* TypeKeys */
export type TypeKeys<T, U> = {
	[K in keyof T]: T[K] extends U ? (K extends string ? K : never) : never;
}[keyof T];

export type ObjectKeys<T> = TypeKeys<T, object>;

export type StringKeys<T> = TypeKeys<T, string>;
export type NullableStringKeys<T> = TypeKeys<T, string | undefined | null>;

export type NumberKeys<T> = TypeKeys<T, number>;
export type NullableNumberKeys<T> = TypeKeys<T, number | undefined | null>;

export type BooleanKeys<T> = TypeKeys<T, boolean>;
export type NullableBooleanKeys<T> = TypeKeys<T, boolean | undefined | null>;

export type DateKeys<T> = TypeKeys<T, Date>;
export type NullableDateKeys<T> = TypeKeys<T, Date | undefined | null>;

export type ArrayStringKeys<T> = TypeKeys<T, string[]>;
export type NullableArrayStringKeys<T> = TypeKeys<T, string[] | undefined | null>;

/* Named TypeKeys */
export type TypeKeysWithSuffix<T extends string | number | symbol, POSTFIX extends string> = {
	[K in T]: K extends `${string}${POSTFIX}` ? K : never;
}[T];

export const isIterableIterator = <T extends object>(
	object: unknown
): object is IterableIterator<T> =>
	typeof object === 'object' &&
	object !== null &&
	typeof (object as IterableIterator<T>).next === 'function' &&
	typeof (object as IterableIterator<T>)[Symbol.iterator] === 'function';

import { PersistentKeyRegExp } from '$types/persistent';

export const match = (parameter: string) => PersistentKeyRegExp.test(parameter);

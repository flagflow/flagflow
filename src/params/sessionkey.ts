import { PersistentSessionKeyRegExp } from '$types/persistent';

export const match = (parameter: string) => PersistentSessionKeyRegExp.test(parameter);

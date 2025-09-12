import { PersistentHierarchicalKeyRegExp } from '$types/persistent';

export const match = (parameter: string) => PersistentHierarchicalKeyRegExp.test(parameter);

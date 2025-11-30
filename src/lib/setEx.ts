export const arrayDiff = <T>(a: T[], b: T[]): T[] => a.filter((x) => !b.includes(x));

export const entitySymmetricDiff = <T>(
	current: T[],
	requirement: T[]
): { insert: T[]; drop: T[] } => ({
	insert: arrayDiff(requirement, current),
	drop: arrayDiff(current, requirement)
});

export const objectSymmetricDiff = <K extends string | number, T>(
	current: Record<K, T>,
	requirement: Record<K, T>
): {
	insert: Record<K, T>;
	update: Record<K, T>;
	drop: Record<K, T>;
} => {
	const insert: Record<K, T> = {} as Record<K, T>;
	const update: Record<K, T> = {} as Record<K, T>;
	const drop: Record<K, T> = {} as Record<K, T>;

	for (const key of Object.keys(current))
		if (Object.keys(requirement).includes(key)) update[key as K] = requirement[key as K];
		else drop[key as K] = current[key as K];

	for (const key of Object.keys(requirement))
		if (!Object.keys(current).includes(key)) insert[key as K] = requirement[key as K];

	return {
		insert,
		update,
		drop
	};
};

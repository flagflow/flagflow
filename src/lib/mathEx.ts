export const roundTo = (number: number, digits: number): number => {
	const multiplier = 10 ** digits;
	return Math.round(number * multiplier) / multiplier;
};

export const clamp = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

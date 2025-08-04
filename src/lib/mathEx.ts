export const roundTo = (number: number, digits: number): number =>
	Math.round(number * 10 ** digits) / 10 ** digits;

export const clamp = (number: number, min: number, max: number): number => {
	if (number < min) return min;
	if (number > max) return max;
	return number;
};

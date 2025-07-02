export const roundTo = (number: number, digits: number): number =>
	Math.round(number * 10 ** digits) / 10 ** digits;

import { z } from 'zod';

export const ZString = () => z.string().trim();
export const ZMinLengthString = (min: number) => ZString().min(min);
export const ZMaxLengthMaybeEmptyString = (max: number) => ZString().max(max);
export const ZNonEmptyString = (max?: number) =>
	max ? ZMinLengthString(1).max(max) : ZMinLengthString(1);

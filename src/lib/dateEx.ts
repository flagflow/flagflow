import { formatDistance } from 'date-fns';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

export const dateAdd = (date: Date, days = 0, hours = 0, minutes = 0, seconds = 0) =>
	new Date(
		date.getTime() +
			days * MS_PER_DAY +
			hours * MS_PER_HOUR +
			minutes * MS_PER_MINUTE +
			seconds * MS_PER_SECOND
	);

export const dateAddSeconds = (date: Date, seconds: number) =>
	new Date(date.getTime() + seconds * MS_PER_SECOND);

export const dateAddMinutes = (date: Date, minutes: number) =>
	new Date(date.getTime() + minutes * MS_PER_MINUTE);

export const dateAddHours = (date: Date, hours: number) =>
	new Date(date.getTime() + hours * MS_PER_HOUR);

export const dateAddDays = (date: Date, days: number) =>
	new Date(date.getTime() + days * MS_PER_DAY);

export const dateDiffDays = (date1: Date, date2: Date) =>
	Math.floor((date1.getTime() - date2.getTime()) / MS_PER_DAY);

export const getRelativeDateString = (from: Date, baseDate?: Date): string =>
	formatDistance(from, baseDate ?? new Date(), { addSuffix: true });

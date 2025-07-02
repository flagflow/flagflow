export const dateAdd = (date: Date, days = 0, hours = 0, minutes = 0, seconds = 0) =>
	new Date(date.getTime() + (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000);

export const dateAddSeconds = (date: Date, seconds: number) => dateAdd(date, 0, 0, 0, seconds);

export const dateAddMinutes = (date: Date, minutes: number) => dateAdd(date, 0, 0, minutes);

export const dateAddHours = (date: Date, hours: number) => dateAdd(date, 0, hours);

export const dateAddDays = (date: Date, days: number) => dateAdd(date, days);

export const dateDiffDays = (date1: Date, date2: Date) =>
	Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
dayjs.extend(quarterOfYear);

const startYear = 2022;
const infinityYear = 2099;
export const dateIntervalAll = 'All';

export const getDateIntervals = () => {
	const currentYear = new Date().getFullYear();
	const previousYear = currentYear - 1;
	const currentQuarter = dayjs().quarter();

	const intervals = [];
	for (let year = startYear; year <= previousYear; year++) intervals.push(`${year}`);

	for (let q = currentQuarter; q <= 4; q++) intervals.push(`${previousYear}Q${q}`);

	intervals.push(`${currentYear}`);
	for (let q = 1; q <= currentQuarter; q++) intervals.push(`${currentYear}Q${q}`);

	intervals.reverse();
	intervals.push(dateIntervalAll);

	return intervals;
};

export const getDateIntervalsForSelect = () =>
	getDateIntervals().map((di) => ({ value: di, name: di }));

export const getIntervalDate = (interval: string): { start: Date; end: Date } => {
	const usableIntervals = getDateIntervals();
	if (!usableIntervals.includes(interval)) interval = usableIntervals[0];

	if (interval === dateIntervalAll)
		return {
			start: dayjs(`${startYear}-01-01`).toDate(),
			end: dayjs(`${infinityYear}-12-31`).toDate()
		};

	const match = interval.match(/^(\d{4})Q(\d)$/);
	if (match) {
		const year = Number.parseInt(match[1]);
		const quarter = Number.parseInt(match[2]);
		return {
			start: dayjs(`${year}-${quarter * 3 - 2}-01`).toDate(),
			end: dayjs(`${year}-${quarter * 3}-01`)
				.endOf('month')
				.toDate()
		};
	}

	return {
		start: dayjs(`${interval}-01-01`).toDate(),
		end: dayjs(`${interval}-12-31`).toDate()
	};
};

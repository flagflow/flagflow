import dayjs from 'dayjs';

export const stVoucherNumberParser = (voucherNumber: string): string[] => [
	...new Set([
		voucherNumber,
		...voucherNumber.split(/[/-]/),
		...voucherNumber.split(/-/),
		...voucherNumber.split(/\//),
		/\/(\d+)$/.test(voucherNumber)
			? Number.parseInt(voucherNumber.match(/\/(\d+)$/)![1]).toString()
			: ''
	])
];

export const stDateParser = (date: Date): string[] => [
	dayjs(date).format('YYYY-MM-DD'),
	dayjs(date).format('YYYY-MM'),
	dayjs(date).format('YYYY'),
	dayjs(date).format('MM-DD')
];

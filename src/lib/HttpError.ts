import { createTextResponse } from './Response';

export class HttpError extends Error {
	name = 'HttpError';
	constructor(
		public message: string,
		public status: number
	) {
		super(message);
	}

	public getResponse = () => createTextResponse(this.message, this.status);
}

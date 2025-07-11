import type { JwtTokens } from './jwt';

export type Authentication =
	| {
			type: 'JWT';
			tokens: JwtTokens;
			success?:
				| {
						userName: string;
						email: string;
						roles: string[];
						expiredAt: Date;
				  }
				| undefined;
	  }
	| {
			type: 'SESSION';
			sessionId: string;
			success?:
				| {
						userName: string;
						roles: string[];
				  }
				| undefined;
	  }
	| {
			type: 'NONE';
			success?: undefined;
	  };

import type { JwtTokens } from './Jwt';

export type Authentication =
	| {
			type: 'JWT';
			tokens: JwtTokens;
			success?:
				| {
						name: string;
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
						name: string;
						roles: string[];
				  }
				| undefined;
	  }
	| {
			type: 'NONE';
			success?: undefined;
	  };

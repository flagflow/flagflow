import type { JwtTokens } from './Jwt';

export type Authentication =
	| {
			type: 'JWT';
			tokens: JwtTokens;
			authentication?:
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
			authentication?:
				| {
						name: string;
						roles: string[];
				  }
				| undefined;
	  }
	| {
			type: 'NONE';
			authentication?: undefined;
	  };

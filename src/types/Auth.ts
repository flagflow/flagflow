import type { JwtTokens } from './Jwt';
import type { UserRole } from './UserRoles';

export type Authentication =
	| {
			type: 'JWT';
			tokens: JwtTokens;
			success?:
				| {
						userName: string;
						email: string;
						roles: UserRole[];
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
						roles: UserRole[];
				  }
				| undefined;
	  }
	| {
			type: 'NONE';
			success?: undefined;
	  };

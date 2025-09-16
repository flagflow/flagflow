import type { JwtTokens } from './Jwt';
import type { UserPermission } from './UserPermissions';

export type Authentication =
	| {
			type: 'JWT';
			tokens: JwtTokens;
			success?:
				| {
						userName: string;
						email: string;
						permissions: UserPermission[];
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
						permissions: UserPermission[];
						passwordExpired?: boolean;
				  }
				| undefined;
	  }
	| {
			type: 'NONE';
			success?: undefined;
	  };

export type AuthenticationType = Authentication['type'];

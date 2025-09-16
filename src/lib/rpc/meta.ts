import type { UserPermission } from '$types/UserPermissions';

export type Meta = {
	permission?: UserPermission;
	allowPasswordExpired?: boolean;
};

import { createRpcRouter } from '$lib/rpc/init';

import { flagRpc } from './flag';
import { migrationRpc } from './migration';
import { sessionRpc } from './session';
import { userRpc } from './user';
import { userSettingRpc } from './userSetting';

export const rootProtectedRpc = createRpcRouter({
	session: sessionRpc,
	user: userRpc,
	flag: flagRpc,
	migration: migrationRpc,
	userSetting: userSettingRpc
});

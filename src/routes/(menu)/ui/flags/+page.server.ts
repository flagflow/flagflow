import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { rpcCaller } }) => {
	const flags = await rpcCaller.flag.getList();
	const flagsEx = flags.map((flag) => ({
		...flag,
		typeToDisplay:
			flag.type === 'BOOLEAN' ? (flag.isKillSwitch ? 'KILL-SWITCH' : 'BOOLEAN') : flag.type,
		valueToDisplay: flag.valueExists ? flag.value : flag.defaultValue
	}));

	return {
		flags: flagsEx
	};
};

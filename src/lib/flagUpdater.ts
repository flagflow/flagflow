import type { EtcdFlag } from '$types/etcd';

export const updateFlag = (current: EtcdFlag, input: EtcdFlag): EtcdFlag => {
	if (current.type !== input.type)
		throw new Error(`Flag type cannot be changed (current: ${current.type}, new: ${input.type})`);

	if (current.type === 'BOOLEAN' && input.type === 'BOOLEAN')
		return {
			...current,
			...input
		};
	if (current.type === 'INTEGER' && input.type === 'INTEGER')
		return {
			...current,
			...input
		};
	if (current.type === 'STRING' && input.type === 'STRING')
		return {
			...current,
			...input
		};
	if (current.type === 'ENUM' && input.type === 'ENUM')
		return {
			...current,
			...input
		};

	throw new Error(`Unknown flag type: ${current.type}`);
};

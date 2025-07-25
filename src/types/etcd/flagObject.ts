import type { EtcdFlag } from './flag';

class EtcdFlagMethods {
	public getDisplayName(this: EtcdFlag) {
		return `${this.type} => ${this.defaultValue}`;
	}
}
export type EtcdFlagObject = EtcdFlag & EtcdFlagMethods;

export const createEtcdFlagObject = (data: EtcdFlag) =>
	Object.assign(Object.create(EtcdFlagMethods.prototype), data) as EtcdFlagObject;

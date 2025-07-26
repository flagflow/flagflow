import { EtcdFlag } from './flag';

class EtcdFlagMethods {
	public getTypescriptType(this: EtcdFlagObject): string {
		switch (this.type) {
			case 'BOOLEAN':
				return 'boolean';
			case 'INTEGER':
				return 'number';
			case 'STRING':
				return 'string';
			case 'ENUM':
				return `${this.enumValues.map((v) => JSON.stringify(v)).join(' | ')}`;
			case 'TAG':
				return `(${this.tagValues.map((v) => JSON.stringify(v)).join(' | ')})[]`;
			default:
				return 'unknown';
		}
	}
}
export type EtcdFlagObject = EtcdFlag & EtcdFlagMethods;

export const createEtcdFlagObject = (data: EtcdFlag) =>
	Object.assign(Object.create(EtcdFlagMethods.prototype), data) as EtcdFlagObject;

export const EtcdFlagObject = EtcdFlag.transform((data) => createEtcdFlagObject(data));

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
				return `${[...this.enumValues]
					.sort()
					.map((v) => JSON.stringify(v))
					.join(' | ')}`;
			case 'TAG':
				return `(${[...this.tagValues]
					.sort()
					.map((v) => JSON.stringify(v))
					.join(' | ')})[]`;
			default:
				return 'never';
		}
	}
	public getHashInfo(this: EtcdFlagObject): string {
		return this.getTypescriptType();
	}
	public getTypescriptDefaultValue(this: EtcdFlagObject): string {
		switch (this.type) {
			case 'BOOLEAN':
				return this.defaultValue ? 'true' : 'false';
			case 'INTEGER':
				return this.defaultValue.toString();
			case 'STRING':
				return JSON.stringify(this.defaultValue);
			case 'ENUM':
				return JSON.stringify(this.defaultValue);
			case 'TAG':
				return `[${[...this.defaultValue]
					.sort()
					.map((v) => JSON.stringify(v))
					.join(', ')}]`;
			default:
				return 'never';
		}
	}
	public getTypescriptZodMethod(this: EtcdFlagObject): string {
		switch (this.type) {
			case 'BOOLEAN':
				return 'z.boolean()';
			case 'INTEGER':
				return 'z.number()';
			case 'STRING':
				return 'z.string()';
			case 'ENUM':
				return `z.enum([${[...this.enumValues]
					.sort()
					.map((v) => JSON.stringify(v))
					.join(', ')}])`;
			case 'TAG':
				return `z.array(z.literal([${[...this.tagValues]
					.sort()
					.map((v) => JSON.stringify(v))
					.join(', ')}]))`;
			default:
				return 'never';
		}
	}
}
export type EtcdFlagObject = EtcdFlag & EtcdFlagMethods;

export const createEtcdFlagObject = (data: EtcdFlag) =>
	Object.assign(Object.create(EtcdFlagMethods.prototype), data) as EtcdFlagObject;

export const EtcdFlagObject = EtcdFlag.transform((data) => createEtcdFlagObject(data));

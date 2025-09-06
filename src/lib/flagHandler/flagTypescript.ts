import type { TObject, TProperty, TPropertyType } from '$lib/objectFlag/grammar';
import { parseObjectSchemaString } from '$lib/objectFlag/parser';
import type { PersistentFlag } from '$types/persistent';

/**
 * Convert object schema to TypeScript type string
 */
const objectSchemaToTypescript = (schema: string): string => {
	try {
		const parsed = parseObjectSchemaString(schema);
		const mainType = parsed.types.find((t) => !t.name);
		if (!mainType) return 'object';
		return objectToTypescript(mainType.typeDescriptor);
	} catch {
		return 'object';
	}
};

const objectToTypescript = (object: TObject): string => {
	const typeString = `{ ${object.properties.map((property) => propertyToTypescript(property)).join('; ')} }`;
	return object.isArray ? `(${typeString})[]` : typeString;
};

const propertyToTypescript = (property: TProperty): string => {
	const optional = property.isOptional ? '?' : '';
	const type = propertyTypeToTypescript(property.propertyType);
	const arrayType = property.isArray ? `(${type})[]` : type;
	return `${property.propertyName}${optional}: ${arrayType}`;
};

const propertyTypeToTypescript = (propertyType: TPropertyType): string => {
	switch (propertyType.type) {
		case 'PROPERTY_TYPE_PRIMITIVE':
			return primitiveTypeToTypescript(propertyType.primitiveType.primitiveType);
		case 'PROPERTY_TYPE_IDENTIFIER':
			return propertyType.identifier;
		case 'PROPERTY_TYPE_OBJECT':
			return objectToTypescript(propertyType.object);
		default:
			return 'unknown';
	}
};

const primitiveTypeToTypescript = (primitiveType: string): string => {
	switch (primitiveType) {
		case 'boolean':
			return 'boolean';
		case 'integer':
		case 'float':
		case 'number':
			return 'number';
		case 'string':
			return 'string';
		default:
			return 'unknown';
	}
};

/**
 * Convert object schema to Zod validation string
 */
const objectSchemaToZod = (schema: string): string => {
	try {
		const parsed = parseObjectSchemaString(schema);
		const mainType = parsed.types.find((t) => !t.name);
		if (!mainType) return 'z.object({})';
		return objectToZod(mainType.typeDescriptor);
	} catch {
		return 'z.object({})';
	}
};

const objectToZod = (object: TObject): string => {
	const zodString = `z.object({ ${object.properties.map((property) => propertyToZod(property)).join(', ')} })`;
	return object.isArray ? `z.array(${zodString})` : zodString;
};

const propertyToZod = (property: TProperty): string => {
	const type = propertyTypeToZod(property.propertyType);
	const arrayType = property.isArray ? `z.array(${type})` : type;
	const optionalType = property.isOptional ? `${arrayType}.optional()` : arrayType;
	return `${property.propertyName}: ${optionalType}`;
};

const propertyTypeToZod = (propertyType: TPropertyType): string => {
	switch (propertyType.type) {
		case 'PROPERTY_TYPE_PRIMITIVE':
			return primitiveTypeToZod(propertyType.primitiveType.primitiveType);
		case 'PROPERTY_TYPE_IDENTIFIER':
			// For referenced types, we'll use z.any() as we don't have the type definition here
			return 'z.any()';
		case 'PROPERTY_TYPE_OBJECT':
			return objectToZod(propertyType.object);
		default:
			return 'z.any()';
	}
};

const primitiveTypeToZod = (primitiveType: string): string => {
	switch (primitiveType) {
		case 'boolean':
			return 'z.boolean()';
		case 'integer':
			return 'z.number().int()';
		case 'float':
		case 'number':
			return 'z.number()';
		case 'string':
			return 'z.string()';
		default:
			return 'z.any()';
	}
};

/*
 * Exported functions
 */
export const flagTypescriptType = (flag: PersistentFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return 'boolean';
		case 'INTEGER':
			return 'number';
		case 'STRING':
			return 'string';
		case 'OBJECT':
			return objectSchemaToTypescript(flag.schema);
		case 'ENUM':
			return `${[...flag.enumValues]
				.toSorted()
				.map((v) => JSON.stringify(v))
				.join(' | ')}`;
		case 'TAG':
			return `(${[...flag.tagValues]
				.toSorted()
				.map((v) => JSON.stringify(v))
				.join(' | ')})[]`;
		case 'AB-TEST':
			return 'string';
		default:
			return 'never';
	}
};

export const flagHashInfo = (flag: PersistentFlag): string => {
	return flagTypescriptType(flag);
};

export const flagTypescriptDefaultValue = (flag: PersistentFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return flag.defaultValue ? 'true' : 'false';
		case 'INTEGER':
			return flag.defaultValue.toString();
		case 'STRING':
			return JSON.stringify(flag.defaultValue);
		case 'OBJECT':
			return flag.defaultValue || '{}';
		case 'ENUM':
			return JSON.stringify(flag.defaultValue);
		case 'TAG':
			return `[${[...flag.defaultValue]
				.toSorted()
				.map((v) => JSON.stringify(v))
				.join(', ')}]`;
		case 'AB-TEST':
			return JSON.stringify('A');
		default:
			return 'never';
	}
};

export const flagTypescriptZodMethod = (flag: PersistentFlag): string => {
	switch (flag.type) {
		case 'BOOLEAN':
			return 'z.boolean()';
		case 'INTEGER':
			return 'z.number()';
		case 'STRING':
			return 'z.string()';
		case 'OBJECT':
			return objectSchemaToZod(flag.schema);
		case 'ENUM':
			return `z.enum([${[...flag.enumValues]
				.toSorted()
				.map((v) => JSON.stringify(v))
				.join(', ')}])`;
		case 'TAG':
			return `z.array(z.enum([${[...flag.tagValues]
				.toSorted()
				.map((v) => JSON.stringify(v))
				.join(', ')}]))`;
		case 'AB-TEST':
			return 'z.string()';
		default:
			return 'never';
	}
};

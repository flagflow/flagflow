import type { TObject, TProperty, TPropertyType } from './grammar';
import type { ObjectSchema } from './parser';

/**
 * Parse a JavaScript object string into an actual object
 * Handles strings like "{ server: 'remote', port: 8080 }"
 */
export const parseJavaScriptObjectString = (objectString: string): Record<string, unknown> => {
	try {
		const jsonString = objectString
			// Convert unquoted keys to quoted keys
			.replaceAll(/([,{]\s*)([\w$]+)\s*:/g, '$1"$2":')
			// Convert single quotes to double quotes for string values
			.replaceAll(/'([^']*)'/g, '"$1"')
			// Handle trailing commas
			.replaceAll(/,(\s*[\]}])/g, '$1');

		return JSON.parse(jsonString);
	} catch (error) {
		throw new Error(
			`Failed to parse object: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
};

export const validateObjectSchema = (schema: ObjectSchema, object: object | string): void => {
	const mainType = schema.types.find((t) => !t.name);
	if (!mainType) throw new Error('Schema must have at least one unnamed type');

	// Handle string input by parsing it as JavaScript object syntax
	const parsedObject = typeof object === 'string' ? parseJavaScriptObjectString(object) : object;

	validateObject(mainType.typeDescriptor, parsedObject, schema);
};

const validateObject = (objectDefinition: TObject, value: unknown, schema: ObjectSchema): void => {
	if (objectDefinition.isArray) {
		if (!Array.isArray(value)) throw new TypeError('Expected array but got non-array value');
		for (const item of value) validateObjectProperties(objectDefinition.properties, item, schema);
	} else validateObjectProperties(objectDefinition.properties, value, schema);
};

const validateObjectProperties = (
	properties: TProperty[],
	object: unknown,
	schema: ObjectSchema
): void => {
	if (object === null || typeof object !== 'object')
		throw new Error('Expected object but got non-object value');

	const object_ = object as Record<string, unknown>;

	// Create a set of allowed property names for efficient lookup
	const allowedProperties = new Set(properties.map((p) => p.propertyName));

	// Check for extra properties not declared in schema
	for (const objectPropertyName in object_)
		if (!allowedProperties.has(objectPropertyName))
			throw new Error(`Property '${objectPropertyName}' is not declared in schema`);

	for (const property of properties) {
		const { propertyName, isOptional, propertyType, isArray } = property;

		if (!(propertyName in object_)) {
			if (!isOptional) throw new Error(`Missing required property: ${propertyName}`);
			continue;
		}

		const value = object_[propertyName];

		if (isArray) {
			if (!Array.isArray(value)) throw new TypeError(`Property ${propertyName} should be an array`);
			for (const item of value) validatePropertyType(propertyType, item, propertyName, schema);
		} else validatePropertyType(propertyType, value, propertyName, schema);
	}
};

const validatePropertyType = (
	propertyType: TPropertyType,
	value: unknown,
	propertyName: string,
	schema: ObjectSchema
): void => {
	switch (propertyType.type) {
		case 'PROPERTY_TYPE_PRIMITIVE':
			validatePrimitiveType(propertyType.primitiveType.primitiveType, value, propertyName);
			break;
		case 'PROPERTY_TYPE_IDENTIFIER':
			{
				const referencedType = schema.types.find((t) => t.name === propertyType.identifier);
				if (!referencedType)
					throw new Error(`Referenced type '${propertyType.identifier}' not found`);
				validateObject(referencedType.typeDescriptor, value, schema);
			}
			break;
		case 'PROPERTY_TYPE_OBJECT':
			validateObject(propertyType.object, value, schema);
			break;
		default:
			throw new Error(`Unknown property type`);
	}
};

const validatePrimitiveType = (
	primitiveType: string,
	value: unknown,
	propertyName: string
): void => {
	switch (primitiveType) {
		case 'boolean':
			if (typeof value !== 'boolean')
				throw new TypeError(`Property ${propertyName} should be a boolean`);
			break;
		case 'integer':
			if (!Number.isInteger(value))
				throw new TypeError(`Property ${propertyName} should be an integer`);
			break;
		case 'float':
		case 'number':
			if (typeof value !== 'number' || Number.isNaN(value))
				throw new TypeError(`Property ${propertyName} should be a number`);
			break;
		case 'string':
			if (typeof value !== 'string')
				throw new TypeError(`Property ${propertyName} should be a string`);
			break;
		default:
			throw new Error(`Unknown primitive type: ${primitiveType}`);
	}
};

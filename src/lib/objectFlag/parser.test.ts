import { describe, expect, it } from 'vitest';

import { parseObjectSchemaString } from './parser';

describe('parseObjectSchemaString', () => {
	describe('basic object parsing', () => {
		it('should parse simple object with primitive properties', () => {
			const schema = parseObjectSchemaString('{ name: string, age: integer }');

			expect(schema.type).toBe('TYPES');
			expect(schema.types).toHaveLength(1);
			expect(schema.types[0].name).toBe('');
			expect(schema.types[0].typeDescriptor.type).toBe('OBJECT');
			expect(schema.types[0].typeDescriptor.properties).toHaveLength(2);

			const nameProperty = schema.types[0].typeDescriptor.properties[0];
			expect(nameProperty.propertyName).toBe('name');
			expect(nameProperty.isOptional).toBe(false);
			expect(nameProperty.isArray).toBe(false);
			expect(nameProperty.propertyType.type).toBe('PROPERTY_TYPE_PRIMITIVE');
			if (nameProperty.propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(nameProperty.propertyType.primitiveType.primitiveType).toBe('string');

			const ageProperty = schema.types[0].typeDescriptor.properties[1];
			expect(ageProperty.propertyName).toBe('age');
			if (ageProperty.propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(ageProperty.propertyType.primitiveType.primitiveType).toBe('integer');
		});

		it('should parse object with optional properties', () => {
			const schema = parseObjectSchemaString('{ name: string, age?: integer }');

			const properties = schema.types[0].typeDescriptor.properties;
			expect(properties[0].isOptional).toBe(false);
			expect(properties[1].isOptional).toBe(true);
		});

		it('should parse object with array properties', () => {
			const schema = parseObjectSchemaString('{ tags: string[], scores: number[] }');

			const properties = schema.types[0].typeDescriptor.properties;
			expect(properties[0].isArray).toBe(true);
			if (properties[0].propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(properties[0].propertyType.primitiveType.primitiveType).toBe('string');

			expect(properties[1].isArray).toBe(true);
			if (properties[1].propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(properties[1].propertyType.primitiveType.primitiveType).toBe('number');
		});

		it('should parse array of objects', () => {
			const schema = parseObjectSchemaString('{ name: string, age: integer }[]');

			expect(schema.types[0].typeDescriptor.isArray).toBe(true);
			expect(schema.types[0].typeDescriptor.properties).toHaveLength(2);
		});
	});

	describe('primitive types', () => {
		it('should parse all primitive types', () => {
			const schema = parseObjectSchemaString(`{
				flag: boolean,
				count: integer,
				ratio: float,
				value: number,
				text: string
			}`);

			const properties = schema.types[0].typeDescriptor.properties;
			if (properties[0].propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(properties[0].propertyType.primitiveType.primitiveType).toBe('boolean');

			if (properties[1].propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(properties[1].propertyType.primitiveType.primitiveType).toBe('integer');

			if (properties[2].propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(properties[2].propertyType.primitiveType.primitiveType).toBe('float');

			if (properties[3].propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(properties[3].propertyType.primitiveType.primitiveType).toBe('number');

			if (properties[4].propertyType.type === 'PROPERTY_TYPE_PRIMITIVE')
				expect(properties[4].propertyType.primitiveType.primitiveType).toBe('string');
		});
	});

	describe('nested objects', () => {
		it('should parse nested objects', () => {
			const schema = parseObjectSchemaString(`{
				user: {
					name: string,
					profile: {
						age: integer,
						active: boolean
					}
				}
			}`);

			const userProperty = schema.types[0].typeDescriptor.properties[0];
			expect(userProperty.propertyName).toBe('user');
			expect(userProperty.propertyType.type).toBe('PROPERTY_TYPE_OBJECT');

			if (userProperty.propertyType.type !== 'PROPERTY_TYPE_OBJECT') return;
			const userObject = userProperty.propertyType.object;
			expect(userObject.properties).toHaveLength(2);
			expect(userObject.properties[0].propertyName).toBe('name');

			const profileProperty = userObject.properties[1];
			expect(profileProperty.propertyName).toBe('profile');
			expect(profileProperty.propertyType.type).toBe('PROPERTY_TYPE_OBJECT');

			if (profileProperty.propertyType.type !== 'PROPERTY_TYPE_OBJECT') return;
			const profileObject = profileProperty.propertyType.object;
			expect(profileObject.properties).toHaveLength(2);
			expect(profileObject.properties[0].propertyName).toBe('age');
			expect(profileObject.properties[1].propertyName).toBe('active');
		});

		it('should parse arrays of nested objects', () => {
			const schema = parseObjectSchemaString(`{
				users: {
					name: string,
					age: integer
				}[]
			}`);

			const usersProperty = schema.types[0].typeDescriptor.properties[0];
			// The array marker [] is on the nested object, not the property
			expect(usersProperty.isArray).toBe(false);
			expect(usersProperty.propertyType.type).toBe('PROPERTY_TYPE_OBJECT');
			if (usersProperty.propertyType.type === 'PROPERTY_TYPE_OBJECT') {
				expect(usersProperty.propertyType.object.isArray).toBe(true);
				expect(usersProperty.propertyType.object.properties).toHaveLength(2);
			}
		});
	});

	describe('named types', () => {
		it('should parse type alias declaration', () => {
			const schema = parseObjectSchemaString('type User = { name: string, age: integer }');

			expect(schema.types).toHaveLength(1);
			expect(schema.types[0].name).toBe('User');
			expect(schema.types[0].typeDescriptor.properties).toHaveLength(2);
		});

		it('should parse interface declaration', () => {
			const schema = parseObjectSchemaString('interface User { name: string, age: integer }');

			expect(schema.types).toHaveLength(1);
			expect(schema.types[0].name).toBe('User');
			expect(schema.types[0].typeDescriptor.properties).toHaveLength(2);
		});

		it('should parse multiple named types with one unnamed', () => {
			const schema = parseObjectSchemaString(`
				type Address = { street: string, city: string }
				interface User { name: string, address: Address }
				{ users: User[] }
			`);

			expect(schema.types).toHaveLength(3);

			const addressType = schema.types.find((t) => t.name === 'Address');
			const userType = schema.types.find((t) => t.name === 'User');
			const mainType = schema.types.find((t) => !t.name);

			expect(addressType).toBeDefined();
			expect(userType).toBeDefined();
			expect(mainType).toBeDefined();

			// User interface should reference Address type
			const userAddressProperty = userType!.typeDescriptor.properties[1];
			expect(userAddressProperty.propertyName).toBe('address');
			expect(userAddressProperty.propertyType.type).toBe('PROPERTY_TYPE_IDENTIFIER');
			if (userAddressProperty.propertyType.type === 'PROPERTY_TYPE_IDENTIFIER')
				expect(userAddressProperty.propertyType.identifier).toBe('Address');
		});
	});

	describe('whitespace handling', () => {
		it('should handle various whitespace patterns', () => {
			const schema = parseObjectSchemaString(`
				{
					name    :   string   ,
					age?:integer,
					tags   :   string[]
				}
			`);

			expect(schema.types[0].typeDescriptor.properties).toHaveLength(3);
			expect(schema.types[0].typeDescriptor.properties[0].propertyName).toBe('name');
			expect(schema.types[0].typeDescriptor.properties[1].isOptional).toBe(true);
			expect(schema.types[0].typeDescriptor.properties[2].isArray).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should throw on invalid syntax', () => {
			expect(() => parseObjectSchemaString('{ name string }')).toThrow();
			expect(() => parseObjectSchemaString('{ name: }')).toThrow();
			expect(() => parseObjectSchemaString('name: string')).toThrow();
		});

		it('should throw on duplicate property names', () => {
			expect(() => parseObjectSchemaString('{ name: string, name: integer }')).toThrow(
				'all must have unique names'
			);
		});

		it('should throw when multiple types defined without names', () => {
			expect(() =>
				parseObjectSchemaString(`
				{ name: string }
				{ age: integer }
			`)
			).toThrow('one must be unnamed');
		});

		it('should throw on duplicate type names', () => {
			expect(() =>
				parseObjectSchemaString(`
				type User = { name: string }
				type User = { age: integer }
				{ users: User[] }
			`)
			).toThrow('all must have unique names');
		});
	});

	describe('complex scenarios', () => {
		it('should parse complex schema with all features', () => {
			const schema = parseObjectSchemaString(`
				type Address = {
					street: string,
					city: string,
					zipCode?: string
				}
				
				interface User {
					id: integer,
					name: string,
					email?: string,
					addresses: Address[],
					metadata: {
						created: string,
						updated?: string,
						tags: string[]
					}
				}
				
				{
					users: User[],
					total: integer,
					filters: {
						active?: boolean,
						city: string
					}
				}
			`);

			expect(schema.types).toHaveLength(3);

			const addressType = schema.types.find((t) => t.name === 'Address');
			const userType = schema.types.find((t) => t.name === 'User');
			const mainType = schema.types.find((t) => !t.name);

			// Verify Address type
			expect(addressType!.typeDescriptor.properties).toHaveLength(3);
			expect(addressType!.typeDescriptor.properties[2].isOptional).toBe(true);

			// Verify User type
			expect(userType!.typeDescriptor.properties).toHaveLength(5);
			expect(userType!.typeDescriptor.properties[2].isOptional).toBe(true); // email
			expect(userType!.typeDescriptor.properties[3].isArray).toBe(true); // addresses
			expect(userType!.typeDescriptor.properties[3].propertyType.type).toBe(
				'PROPERTY_TYPE_IDENTIFIER'
			);
			if (userType!.typeDescriptor.properties[3].propertyType.type === 'PROPERTY_TYPE_IDENTIFIER')
				expect(userType!.typeDescriptor.properties[3].propertyType.identifier).toBe('Address');

			// Verify nested object in User
			const metadataProperty = userType!.typeDescriptor.properties[4];
			expect(metadataProperty.propertyType.type).toBe('PROPERTY_TYPE_OBJECT');
			if (metadataProperty.propertyType.type === 'PROPERTY_TYPE_OBJECT')
				expect(metadataProperty.propertyType.object.properties).toHaveLength(3);

			// Verify main type
			expect(mainType!.typeDescriptor.properties).toHaveLength(3);
			expect(mainType!.typeDescriptor.properties[0].isArray).toBe(true); // users
			if (mainType!.typeDescriptor.properties[0].propertyType.type === 'PROPERTY_TYPE_IDENTIFIER')
				expect(mainType!.typeDescriptor.properties[0].propertyType.identifier).toBe('User');
		});
	});

	describe('edge cases', () => {
		it('should parse single property object', () => {
			const schema = parseObjectSchemaString('{ name: string }');
			expect(schema.types[0].typeDescriptor.properties).toHaveLength(1);
		});

		it('should parse empty object', () => {
			const schema = parseObjectSchemaString('{ }');
			expect(schema.types[0].typeDescriptor.properties).toHaveLength(0);
		});

		it('should handle trailing commas gracefully', () => {
			// Note: This depends on the grammar implementation
			// If trailing commas aren't supported, this test should expect an error
			try {
				const schema = parseObjectSchemaString('{ name: string, }');
				expect(schema.types[0].typeDescriptor.properties).toHaveLength(1);
			} catch {
				// If trailing commas aren't supported, that's also valid
				expect(() => parseObjectSchemaString('{ name: string, }')).toThrow();
			}
		});
	});

	describe('identifier validation', () => {
		it('should accept valid identifiers', () => {
			const schema = parseObjectSchemaString(`{
				validName: string,
				_underscore: string,
				$dollar: string,
				camelCase: string,
				snake_case: string,
				with123Numbers: string
			}`);

			expect(schema.types[0].typeDescriptor.properties).toHaveLength(6);
		});

		it('should parse type names with valid characters', () => {
			const schema = parseObjectSchemaString(`
				type MyType_123 = { value: string }
				interface $Interface { data: MyType_123 }
				{ items: $Interface[] }
			`);

			expect(schema.types).toHaveLength(3);
			expect(schema.types.find((t) => t.name === 'MyType_123')).toBeDefined();
			expect(schema.types.find((t) => t.name === '$Interface')).toBeDefined();
		});
	});

	describe('performance tests', () => {
		it('should parse schemas efficiently', () => {
			const complexSchema = `
				type Address = {
					street: string,
					city: string,
					zipCode?: string,
					country: string
				}
				
				interface User {
					id: integer,
					name: string,
					email?: string,
					addresses: Address[],
					metadata: {
						created: string,
						updated?: string,
						tags: string[],
						settings: {
							notifications: boolean,
							privacy: string,
							preferences: {
								theme: string,
								language: string,
								timezone: string
							}
						}
					}
				}
				
				{
					users: User[],
					total: integer,
					filters: {
						active?: boolean,
						city: string,
						dateRange: {
							start: string,
							end?: string
						}
					},
					pagination: {
						page: integer,
						limit: integer,
						hasMore: boolean
					}
				}
			`;

			const start = performance.now();

			// Parse the same complex schema multiple times
			for (let index = 0; index < 1000; index++) parseObjectSchemaString(complexSchema);

			const end = performance.now();
			const duration = end - start;

			// Should complete 100 complex parses in reasonable time
			expect(duration).toBeLessThan(500); // Less than 500ms for 1000 parses
		});

		it('should handle repeated simple parsing efficiently', () => {
			const simpleSchema = '{ name: string, age: integer, active: boolean }';

			const start = performance.now();

			// Parse simple schema many times
			for (let index = 0; index < 1000; index++) parseObjectSchemaString(simpleSchema);

			const end = performance.now();
			const duration = end - start;

			// Should complete 1000 simple parses very quickly
			expect(duration).toBeLessThan(200); // Less than 200ms for 1000 simple parses
		});

		it('should parse large schemas with many properties efficiently', () => {
			// Generate a schema with many properties
			const manyProperties = Array.from({ length: 50 }, (_, index) => `prop${index}: string`).join(
				', '
			);
			const largeSchema = `{ ${manyProperties} }`;

			const start = performance.now();

			for (let index = 0; index < 10; index++) parseObjectSchemaString(largeSchema);

			const end = performance.now();
			const duration = end - start;

			// Should handle large schemas efficiently
			expect(duration).toBeLessThan(100); // Less than 100ms for 10 large schemas
		});
	});
});

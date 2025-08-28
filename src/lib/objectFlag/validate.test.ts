import { describe, expect, it } from 'vitest';

import { parseObjectSchemaString } from './parser';
import { validateObjectSchema } from './validate';

describe('validateObjectSchema', () => {
	describe('basic validation', () => {
		it('should validate simple object with primitive properties', () => {
			const schema = parseObjectSchemaString('{ name: string, age: integer }');

			expect(() => validateObjectSchema(schema, { name: 'John', age: 25 })).not.toThrow();
		});

		it('should validate object with optional properties present', () => {
			const schema = parseObjectSchemaString('{ name: string, age?: integer }');

			expect(() => validateObjectSchema(schema, { name: 'John', age: 25 })).not.toThrow();
		});

		it('should validate object with optional properties missing', () => {
			const schema = parseObjectSchemaString('{ name: string, age?: integer }');

			expect(() => validateObjectSchema(schema, { name: 'John' })).not.toThrow();
		});

		it('should validate array of objects', () => {
			const schema = parseObjectSchemaString('{ name: string, age: integer }[]');

			expect(() =>
				validateObjectSchema(schema, [
					{ name: 'John', age: 25 },
					{ name: 'Jane', age: 30 }
				])
			).not.toThrow();
		});

		it('should validate empty array of objects', () => {
			const schema = parseObjectSchemaString('{ name: string, age: integer }[]');

			expect(() => validateObjectSchema(schema, [])).not.toThrow();
		});

		it('should validate empty object', () => {
			const schema = parseObjectSchemaString('{ }');

			expect(() => validateObjectSchema(schema, {})).not.toThrow();
		});
	});

	describe('primitive type validation', () => {
		it('should validate all primitive types', () => {
			const schema = parseObjectSchemaString(`{
				flag: boolean,
				count: integer,
				ratio: float,
				value: number,
				text: string
			}`);

			expect(() =>
				validateObjectSchema(schema, {
					flag: true,
					count: 42,
					ratio: 3.14,
					value: 2.718,
					text: 'hello'
				})
			).not.toThrow();
		});

		it('should validate boolean values', () => {
			const schema = parseObjectSchemaString('{ flag: boolean }');

			expect(() => validateObjectSchema(schema, { flag: true })).not.toThrow();
			expect(() => validateObjectSchema(schema, { flag: false })).not.toThrow();
		});

		it('should validate integer values', () => {
			const schema = parseObjectSchemaString('{ count: integer }');

			expect(() => validateObjectSchema(schema, { count: 0 })).not.toThrow();
			expect(() => validateObjectSchema(schema, { count: -5 })).not.toThrow();
			expect(() => validateObjectSchema(schema, { count: 100 })).not.toThrow();
		});

		it('should validate float and number values', () => {
			const schema = parseObjectSchemaString('{ ratio: float, value: number }');

			expect(() => validateObjectSchema(schema, { ratio: 3.14, value: 2.718 })).not.toThrow();
			expect(() => validateObjectSchema(schema, { ratio: 0, value: -1.5 })).not.toThrow();
			expect(() => validateObjectSchema(schema, { ratio: 42, value: 0 })).not.toThrow(); // integers are valid numbers
		});

		it('should validate string values', () => {
			const schema = parseObjectSchemaString('{ text: string }');

			expect(() => validateObjectSchema(schema, { text: '' })).not.toThrow();
			expect(() => validateObjectSchema(schema, { text: 'hello world' })).not.toThrow();
			expect(() => validateObjectSchema(schema, { text: '123' })).not.toThrow();
		});
	});

	describe('array validation', () => {
		it('should validate arrays of primitives', () => {
			const schema = parseObjectSchemaString('{ tags: string[], scores: integer[] }');

			expect(() =>
				validateObjectSchema(schema, {
					tags: ['tag1', 'tag2', 'tag3'],
					scores: [1, 2, 3, 4, 5]
				})
			).not.toThrow();
		});

		it('should validate empty arrays', () => {
			const schema = parseObjectSchemaString('{ tags: string[], scores: integer[] }');

			expect(() =>
				validateObjectSchema(schema, {
					tags: [],
					scores: []
				})
			).not.toThrow();
		});

		it('should validate arrays of nested objects', () => {
			const schema = parseObjectSchemaString(`{
				users: {
					name: string,
					age: integer
				}[]
			}`);

			expect(() =>
				validateObjectSchema(schema, {
					users: [
						{ name: 'John', age: 25 },
						{ name: 'Jane', age: 30 }
					]
				})
			).not.toThrow();
		});
	});

	describe('nested object validation', () => {
		it('should validate nested objects', () => {
			const schema = parseObjectSchemaString(`{
				user: {
					name: string,
					profile: {
						age: integer,
						active: boolean
					}
				}
			}`);

			expect(() =>
				validateObjectSchema(schema, {
					user: {
						name: 'John',
						profile: {
							age: 25,
							active: true
						}
					}
				})
			).not.toThrow();
		});

		it('should validate deeply nested structures', () => {
			const schema = parseObjectSchemaString(`{
				company: {
					name: string,
					departments: {
						name: string,
						employees: {
							name: string,
							position: string,
							details: {
								salary: number,
								active: boolean
							}
						}[]
					}[]
				}
			}`);

			expect(() =>
				validateObjectSchema(schema, {
					company: {
						name: 'TechCorp',
						departments: [
							{
								name: 'Engineering',
								employees: [
									{
										name: 'John',
										position: 'Developer',
										details: {
											salary: 75_000,
											active: true
										}
									}
								]
							}
						]
					}
				})
			).not.toThrow();
		});
	});

	describe('named types validation', () => {
		it('should validate type references', () => {
			const schema = parseObjectSchemaString(`
				type Address = { street: string, city: string }
				interface User { name: string, address: Address }
				{ users: User[] }
			`);

			expect(() =>
				validateObjectSchema(schema, {
					users: [
						{
							name: 'John',
							address: {
								street: '123 Main St',
								city: 'Springfield'
							}
						}
					]
				})
			).not.toThrow();
		});

		it('should validate complex schema with multiple type references', () => {
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

			expect(() =>
				validateObjectSchema(schema, {
					users: [
						{
							id: 1,
							name: 'John Doe',
							email: 'john@example.com',
							addresses: [
								{
									street: '123 Main St',
									city: 'Springfield',
									zipCode: '12345'
								},
								{
									street: '456 Oak Ave',
									city: 'Springfield'
									// zipCode is optional
								}
							],
							metadata: {
								created: '2023-01-01',
								updated: '2023-06-01',
								tags: ['customer', 'premium']
							}
						}
					],
					total: 1,
					filters: {
						active: true,
						city: 'Springfield'
					}
				})
			).not.toThrow();
		});
	});

	describe('error cases', () => {
		describe('schema errors', () => {
			it('should throw when schema has no unnamed type', () => {
				const schema = parseObjectSchemaString('type User = { name: string }');

				expect(() => validateObjectSchema(schema, {})).toThrow(
					'Schema must have at least one unnamed type'
				);
			});
		});

		describe('type mismatches', () => {
			it('should throw on boolean type mismatch', () => {
				const schema = parseObjectSchemaString('{ flag: boolean }');

				expect(() => validateObjectSchema(schema, { flag: 'true' })).toThrow(
					'Property flag should be a boolean'
				);
				expect(() => validateObjectSchema(schema, { flag: 1 })).toThrow(
					'Property flag should be a boolean'
				);
				expect(() => validateObjectSchema(schema, { flag: undefined })).toThrow(
					'Property flag should be a boolean'
				);
			});

			it('should throw on integer type mismatch', () => {
				const schema = parseObjectSchemaString('{ count: integer }');

				expect(() => validateObjectSchema(schema, { count: 3.14 })).toThrow(
					'Property count should be an integer'
				);
				expect(() => validateObjectSchema(schema, { count: '42' })).toThrow(
					'Property count should be an integer'
				);
				expect(() => validateObjectSchema(schema, { count: true })).toThrow(
					'Property count should be an integer'
				);
			});

			it('should throw on number type mismatch', () => {
				const schema = parseObjectSchemaString('{ value: number }');

				expect(() => validateObjectSchema(schema, { value: '3.14' })).toThrow(
					'Property value should be a number'
				);
				expect(() => validateObjectSchema(schema, { value: true })).toThrow(
					'Property value should be a number'
				);
				expect(() => validateObjectSchema(schema, { value: Number.NaN })).toThrow(
					'Property value should be a number'
				);
			});

			it('should throw on string type mismatch', () => {
				const schema = parseObjectSchemaString('{ text: string }');

				expect(() => validateObjectSchema(schema, { text: 123 })).toThrow(
					'Property text should be a string'
				);
				expect(() => validateObjectSchema(schema, { text: true })).toThrow(
					'Property text should be a string'
				);
				expect(() => validateObjectSchema(schema, { text: undefined })).toThrow(
					'Property text should be a string'
				);
			});
		});

		describe('missing properties', () => {
			it('should throw on missing required property', () => {
				const schema = parseObjectSchemaString('{ name: string, age: integer }');

				expect(() => validateObjectSchema(schema, { name: 'John' })).toThrow(
					'Missing required property: age'
				);
				expect(() => validateObjectSchema(schema, { age: 25 })).toThrow(
					'Missing required property: name'
				);
				expect(() => validateObjectSchema(schema, {})).toThrow('Missing required property: name');
			});

			it('should not throw on missing optional property', () => {
				const schema = parseObjectSchemaString('{ name: string, age?: integer }');

				expect(() => validateObjectSchema(schema, { name: 'John' })).not.toThrow();
			});
		});

		describe('array validation errors', () => {
			it('should throw when expecting array but got non-array', () => {
				const schema = parseObjectSchemaString('{ name: string, age: integer }[]');

				expect(() => validateObjectSchema(schema, { name: 'John', age: 25 })).toThrow(
					'Expected array but got non-array value'
				);
			});

			it('should throw when property should be array but is not', () => {
				const schema = parseObjectSchemaString('{ tags: string[] }');

				expect(() => validateObjectSchema(schema, { tags: 'tag1' })).toThrow(
					'Property tags should be an array'
				);
				expect(() => validateObjectSchema(schema, { tags: undefined })).toThrow(
					'Property tags should be an array'
				);
			});

			it('should throw when array items have wrong type', () => {
				const schema = parseObjectSchemaString('{ tags: string[] }');

				expect(() => validateObjectSchema(schema, { tags: ['valid', 123, 'also valid'] })).toThrow(
					'Property tags should be a string'
				);
			});

			it('should throw when array of objects contains invalid items', () => {
				const schema = parseObjectSchemaString(`{
					users: {
						name: string,
						age: integer
					}[]
				}`);

				expect(() =>
					validateObjectSchema(schema, {
						users: [
							{ name: 'John', age: 25 },
							{ name: 'Jane' } // missing age
						]
					})
				).toThrow('Missing required property: age');
			});
		});

		describe('object validation errors', () => {
			it('should throw when expecting object but got primitive', () => {
				const schema = parseObjectSchemaString('{ user: { name: string } }');

				expect(() => validateObjectSchema(schema, { user: 'John' })).toThrow(
					'Expected object but got non-object value'
				);
				expect(() => validateObjectSchema(schema, { user: 123 })).toThrow(
					'Expected object but got non-object value'
				);
				expect(() => validateObjectSchema(schema, { user: true })).toThrow(
					'Expected object but got non-object value'
				);
			});

			it('should throw when expecting object but got null', () => {
				const schema = parseObjectSchemaString('{ user: { name: string } }');

				// eslint-disable-next-line unicorn/no-null
				expect(() => validateObjectSchema(schema, { user: null })).toThrow(
					'Expected object but got non-object value'
				);
			});

			it('should throw when expecting object but got array', () => {
				const schema = parseObjectSchemaString('{ user: { name: string } }');

				// Arrays are objects in JavaScript with numeric indices as properties
				// Strict validation now catches these as extra properties first
				expect(() => validateObjectSchema(schema, { user: ['John'] })).toThrow(
					"Property '0' is not declared in schema"
				);
			});
		});

		describe('type reference errors', () => {
			it('should throw when referenced type is not found', () => {
				const schema = parseObjectSchemaString(`
					type User = { name: string, address: Address }
					{ users: User[] }
				`);

				expect(() =>
					validateObjectSchema(schema, {
						users: [{ name: 'John', address: { street: '123 Main St' } }]
					})
				).toThrow("Referenced type 'Address' not found");
			});
		});

		describe('extra property errors', () => {
			it('should throw when object has single extra property', () => {
				const schema = parseObjectSchemaString('{ name: string, age: integer }');

				expect(() =>
					validateObjectSchema(schema, {
						name: 'John',
						age: 25,
						city: 'Springfield'
					})
				).toThrow("Property 'city' is not declared in schema");
			});

			it('should throw when object has multiple extra properties', () => {
				const schema = parseObjectSchemaString('{ name: string }');

				expect(() =>
					validateObjectSchema(schema, {
						name: 'John',
						age: 25,
						city: 'Springfield',
						country: 'USA'
					})
				).toThrow("Property 'age' is not declared in schema");
			});

			it('should throw when nested object has extra properties', () => {
				const schema = parseObjectSchemaString(`{
					user: {
						name: string,
						age: integer
					}
				}`);

				expect(() =>
					validateObjectSchema(schema, {
						user: {
							name: 'John',
							age: 25,
							email: 'john@example.com'
						}
					})
				).toThrow("Property 'email' is not declared in schema");
			});

			it('should throw when array items have extra properties', () => {
				const schema = parseObjectSchemaString(`{
					users: {
						name: string,
						age: integer
					}[]
				}`);

				expect(() =>
					validateObjectSchema(schema, {
						users: [
							{ name: 'John', age: 25 },
							{ name: 'Jane', age: 30, city: 'Boston' }
						]
					})
				).toThrow("Property 'city' is not declared in schema");
			});

			it('should throw when type reference object has extra properties', () => {
				const schema = parseObjectSchemaString(`
					type User = { name: string, age: integer }
					{ user: User }
				`);

				expect(() =>
					validateObjectSchema(schema, {
						user: {
							name: 'John',
							age: 25,
							email: 'john@example.com'
						}
					})
				).toThrow("Property 'email' is not declared in schema");
			});

			it('should work correctly when no extra properties present', () => {
				const schema = parseObjectSchemaString('{ name: string, age: integer }');

				expect(() =>
					validateObjectSchema(schema, {
						name: 'John',
						age: 25
					})
				).not.toThrow();
			});
		});
	});

	describe('edge cases', () => {
		it('should throw error when object has extra properties', () => {
			const schema = parseObjectSchemaString('{ name: string }');

			// Extra properties should now cause validation errors (strict validation)
			expect(() =>
				validateObjectSchema(schema, {
					name: 'John',
					extraProperty: 'not allowed'
				})
			).toThrow("Property 'extraProperty' is not declared in schema");
		});

		it('should validate complex nested structure with optional properties', () => {
			const schema = parseObjectSchemaString(`{
				data: {
					required: string,
					optional?: {
						nested?: integer,
						array?: string[]
					}
				}
			}`);

			// All optional nested properties missing
			expect(() =>
				validateObjectSchema(schema, {
					data: { required: 'test' }
				})
			).not.toThrow();

			// Some optional properties present
			expect(() =>
				validateObjectSchema(schema, {
					data: {
						required: 'test',
						optional: {
							nested: 42
						}
					}
				})
			).not.toThrow();

			// All properties present
			expect(() =>
				validateObjectSchema(schema, {
					data: {
						required: 'test',
						optional: {
							nested: 42,
							array: ['a', 'b', 'c']
						}
					}
				})
			).not.toThrow();
		});

		it('should validate arrays with mixed valid types for number/float', () => {
			const schema = parseObjectSchemaString('{ values: number[] }');

			expect(() =>
				validateObjectSchema(schema, {
					values: [1, 2.5, 3, 4.7, 0, -1.5]
				})
			).not.toThrow();
		});

		it('should validate zero and negative numbers correctly', () => {
			const schema = parseObjectSchemaString(`{
				count: integer,
				ratio: float,
				value: number
			}`);

			expect(() =>
				validateObjectSchema(schema, {
					count: 0,
					ratio: 0,
					value: -123.456
				})
			).not.toThrow();

			expect(() =>
				validateObjectSchema(schema, {
					count: -42,
					ratio: -3.14,
					value: 0
				})
			).not.toThrow();
		});
	});

	describe('JavaScript object string parsing', () => {
		it('should parse simple JavaScript object strings', () => {
			const schema = parseObjectSchemaString('{ server: string, port: integer }');

			expect(() => validateObjectSchema(schema, "{ server: 'remote', port: 8080 }")).not.toThrow();
		});

		it('should parse JavaScript object strings with different quote styles', () => {
			const schema = parseObjectSchemaString('{ name: string, active: boolean }');

			expect(() => validateObjectSchema(schema, `{ name: "John", active: true }`)).not.toThrow();

			expect(() => validateObjectSchema(schema, `{ name: 'Jane', active: false }`)).not.toThrow();
		});

		it('should parse JavaScript object strings with numbers', () => {
			const schema = parseObjectSchemaString('{ id: integer, score: float, ratio: number }');

			expect(() =>
				validateObjectSchema(schema, '{ id: 42, score: 3.14, ratio: 2.718 }')
			).not.toThrow();
		});

		it('should parse JavaScript object strings with arrays', () => {
			const schema = parseObjectSchemaString('{ tags: string[], scores: integer[] }');

			expect(() =>
				validateObjectSchema(schema, "{ tags: ['tag1', 'tag2'], scores: [1, 2, 3] }")
			).not.toThrow();
		});

		it('should parse JavaScript object strings with nested objects', () => {
			const schema = parseObjectSchemaString(`{
				user: {
					name: string,
					profile: {
						age: integer,
						active: boolean
					}
				}
			}`);

			expect(() =>
				validateObjectSchema(
					schema,
					`{
					user: {
						name: 'John',
						profile: {
							age: 25,
							active: true
						}
					}
				}`
				)
			).not.toThrow();
		});

		it('should handle JavaScript object strings with mixed data types', () => {
			const schema = parseObjectSchemaString(`{
				config: {
					server: string,
					port: integer,
					ssl: boolean,
					timeout: float,
					endpoints: string[],
					metadata: {
						version: string,
						features: string[]
					}
				}
			}`);

			expect(() =>
				validateObjectSchema(
					schema,
					`{
					config: {
						server: 'localhost',
						port: 8080,
						ssl: true,
						timeout: 30.5,
						endpoints: ['/api/v1', '/api/v2'],
						metadata: {
							version: '1.0.0',
							features: ['auth', 'logging']
						}
					}
				}`
				)
			).not.toThrow();
		});

		it('should handle JavaScript object strings with optional properties', () => {
			const schema = parseObjectSchemaString('{ name: string, age?: integer, email?: string }');

			expect(() => validateObjectSchema(schema, "{ name: 'John' }")).not.toThrow();

			expect(() => validateObjectSchema(schema, "{ name: 'John', age: 25 }")).not.toThrow();

			expect(() =>
				validateObjectSchema(schema, "{ name: 'John', age: 25, email: 'john@example.com' }")
			).not.toThrow();
		});

		it('should throw error for invalid JavaScript object strings', () => {
			const schema = parseObjectSchemaString('{ name: string, age: integer }');

			expect(() => validateObjectSchema(schema, "{ name: 'John', age: }")).toThrow(
				'Failed to parse object'
			);

			expect(() => validateObjectSchema(schema, "{ name: 'John' age: 25 }")).toThrow(
				'Failed to parse object'
			);

			expect(() => validateObjectSchema(schema, 'invalid object string')).toThrow(
				'Failed to parse object'
			);
		});

		it('should throw error for JavaScript object strings that do not match schema', () => {
			const schema = parseObjectSchemaString('{ server: string, port: integer }');

			expect(() => validateObjectSchema(schema, "{ server: 123, port: 'invalid' }")).toThrow(
				'Property server should be a string'
			);

			expect(() => validateObjectSchema(schema, "{ server: 'remote' }")).toThrow(
				'Missing required property: port'
			);

			expect(() =>
				validateObjectSchema(schema, "{ server: 'remote', port: 8080, extra: 'not allowed' }")
			).toThrow("Property 'extra' is not declared in schema");
		});

		it('should parse empty JavaScript object strings', () => {
			const schema = parseObjectSchemaString('{ }');

			expect(() => validateObjectSchema(schema, '{}')).not.toThrow();

			expect(() => validateObjectSchema(schema, '{ }')).not.toThrow();
		});

		it('should parse JavaScript object strings with array of objects', () => {
			const schema = parseObjectSchemaString('{ name: string, age: integer }[]');

			expect(() =>
				validateObjectSchema(
					schema,
					`[
					{ name: 'John', age: 25 },
					{ name: 'Jane', age: 30 }
				]`
				)
			).not.toThrow();
		});

		it('should maintain backward compatibility with object input', () => {
			const schema = parseObjectSchemaString('{ server: string, port: integer }');

			// Original object input should still work
			expect(() => validateObjectSchema(schema, { server: 'remote', port: 8080 })).not.toThrow();
		});
	});

	describe('performance and stress tests', () => {
		it('should handle large arrays efficiently', () => {
			const schema = parseObjectSchemaString('{ items: integer[] }');
			const largeArray = Array.from({ length: 1000 }, (_, index) => index);

			expect(() => validateObjectSchema(schema, { items: largeArray })).not.toThrow();
		});

		it('should handle deep nesting efficiently', () => {
			const schema = parseObjectSchemaString(`{
				level1: {
					level2: {
						level3: {
							level4: {
								level5: {
									value: string
								}
							}
						}
					}
				}
			}`);

			expect(() =>
				validateObjectSchema(schema, {
					level1: {
						level2: {
							level3: {
								level4: {
									level5: {
										value: 'deep'
									}
								}
							}
						}
					}
				})
			).not.toThrow();
		});

		it('should handle many properties efficiently', () => {
			// Create a schema with many properties
			const properties = Array.from({ length: 100 }, (_, index) => `prop${index}: string`).join(
				', '
			);
			const schema = parseObjectSchemaString(`{ ${properties} }`);

			// Create matching object
			const testObject: Record<string, string> = {};
			for (let index = 0; index < 100; index++) {
				testObject[`prop${index}`] = `value${index}`;
			}

			expect(() => validateObjectSchema(schema, testObject)).not.toThrow();
		});
	});
});

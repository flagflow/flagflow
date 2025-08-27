/* eslint-disable unicorn/consistent-function-scoping */
import { createToken, EmbeddedActionsParser, Lexer } from 'chevrotain';

// Tokens
const Tokens = {
	WhiteSpace: createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED }),

	ArraySign: createToken({ name: '[]', pattern: /\[]/ }),

	LCurly: createToken({ name: '{', pattern: /{/ }),
	RCurly: createToken({ name: '}', pattern: /}/ }),
	LSquare: createToken({ name: '[', pattern: /\[/ }),
	RSquare: createToken({ name: ']', pattern: /]/ }),
	Comma: createToken({ name: ',', pattern: /,/ }),
	Colon: createToken({ name: ':', pattern: /:/ }),
	QuestionMark: createToken({ name: '?', pattern: /\?/ }),
	Equal: createToken({ name: '=', pattern: /=/ }),

	BOOLEAN: createToken({ name: 'boolean', pattern: /boolean/ }),
	INTEGER: createToken({ name: 'integer', pattern: /integer/ }),
	FLOAT: createToken({ name: 'float', pattern: /float/ }),
	NUMBER: createToken({ name: 'number', pattern: /number/ }),
	STRING: createToken({ name: 'string', pattern: /string/ }),

	TYPE: createToken({ name: 'type', pattern: /type/ }),
	INTERFACE: createToken({ name: 'interface', pattern: /interface/ }),

	stringValue: createToken({
		name: 'stringValue',
		pattern: /"(?:[^"\\]|\\(?:["/\\bfnrtv]|u[\dA-Fa-f]{4}))*"/
	}),
	numberValue: createToken({
		name: 'numberValue',
		pattern: /-?(0|[1-9]\d*)(\.\d+)?([Ee][+-]?\d+)?/
	}),
	boolValue: createToken({ name: 'boolValue', pattern: /true|false/i }),
	identifier: createToken({ name: 'identifier', pattern: /[$_a-z][\w$]*/i })
};
const TokensArray = Object.values(Tokens);

// Circular reference for TypeScript
export type TObject = {
	type: 'OBJECT';
	properties: ReturnType<TypeParser['property']>[];
	isArray: boolean;
};

// Parser
class TypeParser extends EmbeddedActionsParser {
	constructor() {
		super(TokensArray);
		this.performSelfAnalysis();
	}

	public types = this.RULE('types', () => {
		const types: ReturnType<TypeParser['typeDescriptor']>[] = [];
		this.AT_LEAST_ONE(() => {
			types.push(this.SUBRULE(this.typeDescriptor));
		});

		this.ACTION(() => {
			if (types.length > 1 && types.filter((t) => !t.name).length !== 1)
				throw new Error('When multiple types are defined, one must be unnamed');
			if (types.length > 1 && new Set(types.map((t) => t.name)).size !== types.length)
				throw new Error('When multiple types are defined, all must have unique names');
		});

		return {
			type: 'TYPES' as const,
			types
		} as const;
	});

	public typeDescriptor = this.RULE('typeDescriptor', () => {
		let name = '';
		this.OPTION(() => {
			this.OR([
				{
					ALT: () => {
						this.CONSUME1(Tokens.TYPE);
						name = this.CONSUME1(Tokens.identifier).image;
						this.CONSUME1(Tokens.Equal);
					}
				},
				{
					ALT: () => {
						this.CONSUME2(Tokens.INTERFACE);
						name = this.CONSUME2(Tokens.identifier).image;
					}
				}
			]);
		});
		const typeDescriptor = this.SUBRULE(this.object);

		return {
			type: 'TYPE_DESCRIPTOR' as const,
			name,
			typeDescriptor
		} as const;
	});

	public object = this.RULE('object', () => {
		const properties: ReturnType<TypeParser['property']>[] = [];
		let isArray = false;

		this.CONSUME(Tokens.LCurly);
		this.MANY_SEP({
			SEP: Tokens.Comma,
			DEF: () => {
				properties.push(this.SUBRULE(this.property));
			}
		});
		this.CONSUME(Tokens.RCurly);
		this.OPTION(() => {
			isArray = !!this.CONSUME(Tokens.ArraySign);
		});

		this.ACTION(() => {
			if (
				properties.length > 1 &&
				new Set(properties.map((p) => p.propertyName)).size !== properties.length
			)
				throw new Error('When multiple properties are defined, all must have unique names');
		});

		return {
			type: 'OBJECT' as const,
			properties,
			isArray
		} as const;
	});

	public property = this.RULE('property', () => {
		let isOptional = false;
		let isArray = false;

		const propertyName = this.CONSUME(Tokens.identifier).image;
		this.OPTION1(() => {
			isOptional = !!this.CONSUME(Tokens.QuestionMark);
		});

		this.CONSUME(Tokens.Colon);

		const propertyType = this.SUBRULE(this.propertyType);
		this.OPTION2(() => {
			isArray = !!this.CONSUME(Tokens.ArraySign);
		});

		return {
			type: 'PROPERTY' as const,
			propertyName,
			isOptional,
			propertyType,
			isArray
		} as const;
	});

	public primitiveType = this.RULE('primitiveType', () => {
		let primitiveType: string = '';

		this.OR([
			{ ALT: () => (primitiveType = this.CONSUME(Tokens.BOOLEAN).image) },
			{ ALT: () => (primitiveType = this.CONSUME(Tokens.INTEGER).image) },
			{ ALT: () => (primitiveType = this.CONSUME(Tokens.FLOAT).image) },
			{ ALT: () => (primitiveType = this.CONSUME(Tokens.NUMBER).image) },
			{ ALT: () => (primitiveType = this.CONSUME(Tokens.STRING).image) }
		]);

		return {
			type: 'PRIMITIVE_TYPE' as const,
			primitiveType
		} as const;
	});

	public propertyType = this.RULE('propertyType', () => {
		let result:
			| { type: 'PROPERTY_TYPE_PRIMITIVE'; primitiveType: ReturnType<TypeParser['primitiveType']> }
			| { type: 'PROPERTY_TYPE_IDENTIFIER'; identifier: string }
			| { type: 'PROPERTY_TYPE_OBJECT'; object: TObject }
			| undefined;

		this.OR([
			{
				ALT: () =>
					(result = {
						type: 'PROPERTY_TYPE_PRIMITIVE',
						primitiveType: this.SUBRULE(this.primitiveType)
					})
			},
			{
				ALT: () =>
					(result = {
						type: 'PROPERTY_TYPE_IDENTIFIER',
						identifier: this.CONSUME(Tokens.identifier).image
					})
			},
			{ ALT: () => (result = { type: 'PROPERTY_TYPE_OBJECT', object: this.SUBRULE(this.object) }) }
		]);

		if (!result) throw new Error('Unexpected property type');

		return result;
	});
}

export type TTypes = ReturnType<TypeParser['types']>;
export type TTypeDescriptor = ReturnType<TypeParser['typeDescriptor']>;
export type TProperty = ReturnType<TypeParser['property']>;
export type TPrimitiveType = ReturnType<TypeParser['primitiveType']>;
export type TPropertyType = ReturnType<TypeParser['propertyType']>;

export const lexerInstance = new Lexer(TokensArray, {
	// Performance optimizations
	ensureOptimizations: true,
	traceInitPerf: false,
	skipValidations: false
});
export const parserInstance = new TypeParser();

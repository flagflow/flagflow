import { lexerInstance, parserInstance, type TTypes } from './grammar';

export type ObjectSchema = TTypes;

const lexer = lexerInstance;
const parser = parserInstance;

export const parseObjectSchemaString = (input: string): ObjectSchema => {
	const lexingResult = lexer.tokenize(input);
	if (lexingResult.errors.length > 0) {
		const error = lexingResult.errors[0];
		throw new Error(`${error.message} at line: ${error.line} column: ${error.column}`);
	}

	parser.input = lexingResult.tokens;
	const cst = parser.types();
	if (parser.errors.length > 0) {
		const error = parser.errors[0];
		throw new Error(
			`${error.message} at line: ${error.token.startLine} column: ${error.token.startColumn}`
		);
	}
	return cst;
};

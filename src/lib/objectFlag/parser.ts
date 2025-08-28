import { lexerInstance, parserInstance, type TTypes } from './grammar';

export type ObjectSchema = TTypes;

const lexer = lexerInstance;
const parser = parserInstance;

export const parseObjectSchemaString = (input: string): ObjectSchema => {
	// Lexical analysis
	const lexingResult = lexer.tokenize(input);
	const lexingErrors = lexingResult.errors;
	if (lexingErrors.length > 0) {
		const error = lexingErrors[0];
		throw new Error(`${error.message} at line: ${error.line} column: ${error.column}`);
	}

	// Reset parser state for reuse
	parser.input = lexingResult.tokens;
	parser.errors.length = 0; // Clear any previous errors

	// Parse tokens
	const cst = parser.types();

	// Check for parsing errors
	const parsingErrors = parser.errors;
	if (parsingErrors.length > 0) {
		const error = parsingErrors[0];
		throw new Error(
			`${error.message} at line: ${error.token.startLine} column: ${error.token.startColumn}`
		);
	}

	return cst;
};

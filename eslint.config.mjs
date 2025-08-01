import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import svelte from 'eslint-plugin-svelte';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import svelteSslintParser from 'svelte-eslint-parser';

const __dirname = import.meta.dirname;
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default [
	{
		ignores: [
			'*.cjs',
			'**/.DS_Store',
			'**/node_modules',
			'build',
			'.svelte-kit',
			'package',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'**/yarn.lock'
		]
	},
	...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),
	...svelte.configs.recommended,
	unicorn.configs.all,
	{
		plugins: {
			'@typescript-eslint': typescriptEslint,
			'simple-import-sort': simpleImportSort
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},

			parser: tsParser,
			ecmaVersion: 2020,
			sourceType: 'module',

			parserOptions: {
				extraFileExtensions: ['.svelte']
			}
		},

		rules: {
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'svelte/require-each-key': 'off',
			'svelte/sort-attributes': 'error',
			'svelte/prefer-const': 'error',
			'svelte/no-unnecessary-state-wrap': 'off',
			'unicorn/filename-case': 'off',
			'unicorn/switch-case-braces': 'off',
			'unicorn/no-document-cookie': 'off',
			'unicorn/no-nested-ternary': 'off',
			'unicorn/no-await-expression-member': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/prefer-global-this': 'off',
			'no-alert': 'error',
			'no-console': 'error',
			'no-debugger': 'error'
		}
	},
	{
		files: ['**/*.svelte'],

		languageOptions: {
			parser: svelteSslintParser,
			ecmaVersion: 5,
			sourceType: 'script',

			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	},
	{
		files: ['tests/**'],
		plugins: {
			vitest
		},
		rules: {
			...vitest.configs.all.rules,
			'vitest/require-hook': 'off',
			'vitest/max-expects': [
				'warn',
				{
					max: 128
				}
			],
			'vitest/no-standalone-expect': [
				'warn',
				{
					additionalTestBlockFunctions: ['rpcCallerTest']
				}
			]
		},
		settings: {
			vitest: {
				typecheck: true
			}
		},
		languageOptions: {
			globals: {
				...vitest.environments.env.globals
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		}
	}
];

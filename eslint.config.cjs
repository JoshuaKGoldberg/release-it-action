const { fixupPluginRules } = require("@eslint/compat");
const eslint = require("@eslint/js");
const stylisticTs = require("@stylistic/eslint-plugin-ts");
const deprecationPlugin = require("eslint-plugin-deprecation");
const jsdocPlugin = require("eslint-plugin-jsdoc");
const jsoncPlugin = require("eslint-plugin-jsonc");
const markdownPlugin = require("eslint-plugin-markdown");
const nPlugin = require("eslint-plugin-n");
const noOnlyTestsPlugin = require("eslint-plugin-no-only-tests");
const perfectionistPlugin = require("eslint-plugin-perfectionist");
const regexpPlugin = require("eslint-plugin-regexp");
const vitestPlugin = require("eslint-plugin-vitest");
const ymlPlugin = require("eslint-plugin-yml");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
	// Global ignores
	{
		ignores: [
			"!.*",
			"coverage",
			"dist",
			"lib",
			"node_modules",
			"pnpm-lock.yaml",
		],
	},

	eslint.configs.recommended,
	nPlugin.configs["flat/recommended"],
	perfectionistPlugin.configs["recommended-natural"],
	regexpPlugin.configs["flat/recommended"],
	vitestPlugin.configs.recommended,
	markdownPlugin.configs.recommended,

	{
		files: ["**/*.{js,cjs,mjs,ts,cts,mts}"],
		languageOptions: {
			globals: {
				...globals.es2022,
				...globals.node,
			},
			parser: tseslint.parser,
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		plugins: {
			"@stylistic/ts": stylisticTs,
			"@typescript-eslint": tseslint.plugin,
			deprecation: fixupPluginRules(deprecationPlugin),
			jsdoc: jsdocPlugin,
			"no-only-tests": noOnlyTestsPlugin,
		},
		rules: {
			// These off/less-strict-by-default rules work well for this repo and we like them on.
			"@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "all" }],
			"no-only-tests/no-only-tests": "error",

			// These on-by-default rules don't work well for this repo and we like them off.
			"no-case-declarations": "off",
			"no-constant-condition": "off",
			"no-inner-declarations": "off",
			"no-mixed-spaces-and-tabs": "off",

			// Stylistic concerns that don't interfere with Prettier
			"@stylistic/ts/padding-line-between-statements": [
				"error",
				{ blankLine: "always", next: "*", prev: "block-like" },
			],
			"perfectionist/sort-objects": [
				"error",
				{
					order: "asc",
					partitionByComment: true,
					type: "natural",
				},
			],
		},
	},
	{
		extends: [
			jsdocPlugin.configs["flat/recommended-typescript-error"],
			tseslint.configs.strict,
			tseslint.configs.stylistic,
		],
		files: ["**/*.ts"],
		rules: {
			// These off-by-default rules work well for this repo and we like them on.
			"jsdoc/informative-docs": "error",
			"logical-assignment-operators": [
				"error",
				"always",
				{ enforceForIfStatements: true },
			],
			"operator-assignment": "error",

			// These on-by-default rules don't work well for this repo and we like them off.
			"jsdoc/require-jsdoc": "off",
			"jsdoc/require-param": "off",
			"jsdoc/require-property": "off",
			"jsdoc/require-returns": "off",
			"n/no-missing-import": "off",
		},
	},
	{
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		files: ["**/*.ts"],
		ignores: ["**/*.md/*.ts"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.eslint.json",
			},
		},
		rules: {
			// These off-by-default rules work well for this repo and we like them on.
			"deprecation/deprecation": "error",
		},
	},
	{
		extends: [jsoncPlugin.configs["flat/recommended-with-json"]],
		files: ["*.json", "*.jsonc"],
		ignores: ["package.json"],
		rules: {
			"jsonc/sort-keys": "error",
		},
	},
	{
		files: ["*.jsonc"],
		rules: {
			"jsonc/no-comments": "off",
		},
	},
	{
		files: ["**/*.test.ts"],
		rules: {
			// These on-by-default rules aren't useful in test files.
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-call": "off",
		},
	},
	{
		extends: [
			ymlPlugin.configs["flat/standard"],
			ymlPlugin.configs["flat/prettier"],
		],
		files: ["**/*.{yml,yaml}"],
		rules: {
			"yml/file-extension": ["error", { extension: "yml" }],
			"yml/sort-keys": [
				"error",
				{
					order: { type: "asc" },
					pathPattern: "^.*$",
				},
			],
			"yml/sort-sequence-values": [
				"error",
				{
					order: { type: "asc" },
					pathPattern: "^.*$",
				},
			],
		},
	},
);

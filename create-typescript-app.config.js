// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockESLint,
	blockKnip,
	blockNcc,
	blockREADME,
	blockReleaseIt,
	blockTSDown,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		addons: [
			blockESLint({
				rules: [
					{
						entries: {
							"n/no-missing-import": "off",
						},
					},
				],
			}),
			blockKnip({
				entry: ["src/action/index.ts"],
				project: ["src/**/*.ts"],
			}),
			blockREADME({
				badges: [
					{
						alt: "📦 npm version",
						href: "http://npmjs.com/package/release-it-action",
						src: "https://img.shields.io/npm/v/release-it-action?color=21bb42&label=%F0%9F%93%A6%20npm",
					},
				],
			}),
		],
		blocks: {
			add: [blockNcc],
			exclude: [blockReleaseIt, blockTSDown],
		},
	},
});

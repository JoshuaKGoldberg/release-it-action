// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockESLint,
	blockGitHubActionsCI,
	blockKnip,
	blockNcc,
	blockREADME,
	blockReleaseIt,
	blockTSDown,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		blocks: {
			add: [blockNcc],
			exclude: [blockReleaseIt, blockTSDown],
		},
		extensions: [
			blockESLint({
				extensions: [
					{
						files: ["**/*.ts"],
						rules: {
							"n/no-missing-import": "off",
						},
					},
					{
						// These file names are referenced outside the repository
						// (e.g. action consumers and npm trusted publishing).
						// This must sort after the generated **/*.{yml,yaml} block.
						files: [
							"action.yml",
							".github/workflows/post-release.yml",
							".github/workflows/rebuild-dist.yml",
							".github/workflows/release.yml",
						],
						rules: {
							"yml/file-extension": "off",
						},
					},
				],
			}),
			blockGitHubActionsCI({
				jobs: [
					{
						checkoutWith: {
							"fetch-depth": "0",
						},
						name: "Action",
						permissions: {
							contents: "read",
						},
						steps: [
							{
								uses: "./",
								with: {
									"github-token": "${{ secrets.GITHUB_TOKEN }}",
									"release-it-args":
										"--dry-run --no-git.push --no-git.requireUpstream",
									"skip-npm-publish": "true",
								},
							},
						],
					},
				],
			}),
			blockKnip({
				entry: ["src/action/index.ts!"],
				project: ["!src/tests/**!", "src/**/*.ts!"],
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
	},
});

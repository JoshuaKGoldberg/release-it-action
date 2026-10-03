import * as core from "@actions/core";
import * as github from "@actions/github";
import { shouldSemanticRelease } from "should-semantic-release";

import { cancellation } from "./cancellation.js";
import { $$ } from "./execa.js";
import { runBypassingBranchProtections } from "./runBypassingBranchProtections.js";
import { runBypassingBranchRulesets } from "./runBypassingBranchRulesets.js";
import { getUnpublishedVersion } from "./steps/getUnpublishedVersion.js";
import { hasGitHubRelease } from "./steps/hasGitHubRelease.js";
import { runReleaseIt } from "./steps/runReleaseIt.js";
import { tryCatchInfoAction } from "./tryCatchInfoAction.js";

export interface ReleaseItActionOptions {
	bypassBranchProtections?: string;
	bypassBranchRulesets?: string;
	githubToken: string;
	gitUserEmail: string;
	gitUserName: string;
	npmToken: string | undefined;
	owner: string;
	releaseItArgs?: string;
	repo: string;
	skipNpmPublish?: boolean;
}

export async function releaseItAction(options: ReleaseItActionOptions) {
	const { gitUserEmail, gitUserName, npmToken, skipNpmPublish } = options;

	await $$`git config user.email ${gitUserEmail}`;
	await $$`git config user.name ${gitUserName}`;
	if (skipNpmPublish) {
		core.info("skipNpmPublish is true. Skipping npm publish.");
	} else if (npmToken) {
		await $$`npm config set //registry.npmjs.org/:_authToken ${npmToken}`;
	} else {
		core.info(
			"No npm token provided. This is required unless you're using Trusted Publishing.",
		);
	}

	if (skipNpmPublish || !npmToken) {
		await runRelease(options);
		return;
	}

	try {
		await runRelease(options);
	} finally {
		await tryCatchInfoAction(
			"removing the npm token from the npmrc",
			async () => await $$`npm config delete //registry.npmjs.org/:_authToken`,
		);
	}
}

async function runRelease({
	bypassBranchProtections,
	bypassBranchRulesets,
	githubToken,
	owner,
	releaseItArgs,
	repo,
	skipNpmPublish = false,
}: ReleaseItActionOptions) {
	// release-it reads the token from the environment, not from this process.
	process.env.GITHUB_TOKEN ??= githubToken;

	const octokit = github.getOctokit(githubToken);

	const unpublishedVersion = skipNpmPublish
		? undefined
		: await tryCatchInfoAction(
				"checking for a version that was pushed but not published",
				getUnpublishedVersion,
			);

	if (unpublishedVersion) {
		const { headTag, version } = unpublishedVersion;

		if (!headTag) {
			core.setFailed(
				`Version ${version} was tagged but never published to npm. Publish it before releasing a newer version, or bump the version manually if npm won't accept it again. If this package isn't meant to be on npm, set the skip-npm-publish option or mark it as private.`,
			);
			return;
		}

		const hasRelease = await tryCatchInfoAction(
			`checking for a GitHub release for ${headTag}`,
			async () =>
				await hasGitHubRelease({ octokit, owner, repo, tag: headTag }),
		);

		core.info(
			`Version ${version} was pushed but never published to npm. Publishing it now.`,
		);

		// First try to create a GitHub release, since they're mutable...
		if (hasRelease === false) {
			await runReleaseIt(
				["--no-increment --no-git --no-npm.publish", releaseItArgs]
					.filter(Boolean)
					.join(" "),
				{ skipSupersededCheck: true },
			);
		}

		// ...and then if that succeeded (didn't throw), do the immutable npm publish
		await runReleaseIt(
			[
				"--no-increment --no-git --npm.publish --npm.skipChecks --no-github.release",
				releaseItArgs,
			]
				.filter(Boolean)
				.join(" "),
			{ allowPublishConflict: true, skipSupersededCheck: true },
		);
		return;
	}

	if (
		(await tryCatchInfoAction(
			"should-semantic-release",
			async () => await shouldSemanticRelease({ verbose: true }),
		)) === false
	) {
		return;
	}

	if (cancellation.signal.aborted) {
		return;
	}

	const args = [skipNpmPublish && "--no-npm.publish", releaseItArgs]
		.filter(Boolean)
		.join(" ");

	const runReleaseItWithArgs = async () => {
		await runReleaseIt(args);
	};

	if (!bypassBranchProtections && !bypassBranchRulesets) {
		await runReleaseItWithArgs();
		return;
	}

	const run = bypassBranchRulesets
		? async () => {
				await runBypassingBranchRulesets(
					{ branch: bypassBranchRulesets, owner, repo },
					octokit,
					runReleaseItWithArgs,
				);
			}
		: runReleaseItWithArgs;

	if (!bypassBranchProtections) {
		await run();
		return;
	}

	await runBypassingBranchProtections(
		{ branch: bypassBranchProtections, owner, repo },
		octokit,
		run,
	);
}

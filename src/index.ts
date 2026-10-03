import * as core from "@actions/core";
import * as github from "@actions/github";
import { shouldSemanticRelease } from "should-semantic-release";

import { $$ } from "./execa.js";
import { parseArgsString } from "./parseArgsString.js";
import { runBypassingBranchProtections } from "./runBypassingBranchProtections.js";
import { runBypassingBranchRulesets } from "./runBypassingBranchRulesets.js";
import { getHeadTagMissingGitHubRelease } from "./steps/getHeadTagMissingGitHubRelease.js";
import { getUnpublishedVersion } from "./steps/getUnpublishedVersion.js";
import { hasGitHubRelease } from "./steps/hasGitHubRelease.js";
import { runReleaseIt, RunReleaseItOptions } from "./steps/runReleaseIt.js";
import {
	tryCatchInfoAction,
	tryCatchSetFailedAction,
} from "./tryCatchInfoAction.js";

export interface ReleaseItActionOptions {
	bypassBranchProtections?: string;
	bypassBranchRulesets?: string;
	githubToken: string;
	gitUserEmail: string;
	gitUserName: string;
	owner: string;
	releaseItArgs?: string;
	repo: string;
	skipNpmPublish?: boolean;
}

export async function releaseItAction(options: ReleaseItActionOptions) {
	const { gitUserEmail, gitUserName, releaseItArgs, skipNpmPublish } = options;

	try {
		parseArgsString(releaseItArgs ?? "");
	} catch (error) {
		core.setFailed(`Invalid release-it-args: ${(error as Error).message}`);
		return;
	}

	await $$`git config user.email ${gitUserEmail}`;
	await $$`git config user.name ${gitUserName}`;
	if (skipNpmPublish) {
		core.info("skipNpmPublish is true. Skipping npm publish.");
	}

	await runRelease(options);
}

const retryArgs =
	"--no-increment --no-git.commit --no-git.tag --no-git.push --no-git.requireCleanWorkingDir --no-git.requireCommits --no-git.requireUpstream";

const restoreTaggedFiles = "'--hooks.before:npm:release=git checkout -- .'";

async function createGitHubRelease(
	releaseItArgs: string | undefined,
	options: RunReleaseItOptions,
) {
	return await runReleaseIt(
		[retryArgs, "--no-npm.publish", releaseItArgs].filter(Boolean).join(" "),
		{ ...options, skipSupersededCheck: true },
	);
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
	const octokit = github.getOctokit(githubToken);

	const unpublishedVersion = skipNpmPublish
		? false
		: await tryCatchSetFailedAction(
				"checking for a version that was pushed but not published",
				async () => (await getUnpublishedVersion(githubToken)) ?? false,
			);

	if (unpublishedVersion === undefined) {
		return;
	}

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

		if (hasRelease === undefined) {
			core.setFailed(
				`Could not check whether ${headTag} has a GitHub release, so ${version} was not published to npm. Fix the error logged above (for example, a github-token that can't read releases), then re-run the release from the commit tagged ${headTag}.`,
			);
			return;
		}

		core.info(
			`Version ${version} was pushed but never published to npm. Publishing it now.`,
		);

		// First try to create a GitHub release, since they're mutable...
		if (
			!hasRelease &&
			!(await createGitHubRelease(releaseItArgs, { githubToken }))
		) {
			core.setFailed(
				`Skipped publishing ${version} to npm because creating the GitHub release for ${headTag} failed. Re-run the release from the commit tagged ${headTag} to retry both.`,
			);
			return;
		}

		// ...and only if that succeeded, do the immutable npm publish
		await runReleaseIt(
			[
				retryArgs,
				"--npm.publish --npm.skipChecks --no-github.release",
				restoreTaggedFiles,
				releaseItArgs,
			]
				.filter(Boolean)
				.join(" "),
			{ allowPublishConflict: true, githubToken, skipSupersededCheck: true },
		);
		return;
	}

	const tagMissingRelease = await tryCatchInfoAction(
		"checking for a version that was pushed without a GitHub release",
		async () =>
			await getHeadTagMissingGitHubRelease({
				octokit,
				owner,
				releaseItArgs,
				repo,
			}),
	);

	if (tagMissingRelease) {
		core.info(
			`Tag ${tagMissingRelease} was pushed but its GitHub release was never created. Creating it now.`,
		);
		// Hooks such as after:release can try to publish the version npm already has.
		await createGitHubRelease(releaseItArgs, {
			allowPublishConflict: true,
			githubToken,
		});
		return;
	}

	if (
		!(await tryCatchSetFailedAction(
			"should-semantic-release",
			async () => await shouldSemanticRelease({ verbose: true }),
		))
	) {
		return;
	}

	const args = [skipNpmPublish && "--no-npm.publish", releaseItArgs]
		.filter(Boolean)
		.join(" ");

	const runReleaseItWithArgs = async () => {
		await runReleaseIt(args, { githubToken });
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

import * as core from "@actions/core";
import * as github from "@actions/github";
import { shouldSemanticRelease } from "should-semantic-release";

import { $$ } from "./execa.js";
import { runBypassingBranchProtections } from "./runBypassingBranchProtections.js";
import { runBypassingBranchRulesets } from "./runBypassingBranchRulesets.js";
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

export async function releaseItAction({
	bypassBranchProtections,
	bypassBranchRulesets,
	githubToken,
	gitUserEmail,
	gitUserName,
	npmToken,
	owner,
	releaseItArgs,
	repo,
	skipNpmPublish = false,
}: ReleaseItActionOptions) {
	if (
		(await tryCatchInfoAction(
			"should-semantic-release",
			async () => await shouldSemanticRelease({ verbose: true }),
		)) === false
	) {
		return;
	}

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

	const octokit = github.getOctokit(githubToken);

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

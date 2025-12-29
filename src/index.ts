import * as core from "@actions/core";
import * as github from "@actions/github";
import { shouldSemanticRelease } from "should-semantic-release";

import { $$ } from "./execa.js";
import { runBypassingBranchProtections } from "./runBypassingBranchProtections.js";
import { runReleaseIt } from "./steps/runReleaseIt.js";
import { tryCatchInfoAction } from "./tryCatchInfoAction.js";

export interface ReleaseItActionOptions {
	bypassBranchProtections?: string;
	githubToken: string;
	gitUserEmail: string;
	gitUserName: string;
	npmToken: string | undefined;
	owner: string;
	releaseItArgs?: string;
	repo: string;
}

export async function releaseItAction({
	bypassBranchProtections,
	githubToken,
	gitUserEmail,
	gitUserName,
	npmToken,
	owner,
	releaseItArgs,
	repo,
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
	if (npmToken) {
		await $$`npm config set //registry.npmjs.org/:_authToken ${npmToken}`;
	} else {
		core.info(
			"No npm token provided!  This is required unless you're using Trusted Publishing.",
		);
	}

	const run = async () => {
		await runReleaseIt(releaseItArgs);
	};

	if (!bypassBranchProtections) {
		await run();
		return;
	}

	const octokit = github.getOctokit(githubToken);

	await runBypassingBranchProtections(
		{ branch: bypassBranchProtections, owner, repo },
		octokit,
		run,
	);
}

import * as github from "@actions/github";
import { shouldSemanticRelease } from "should-semantic-release";

import { $$ } from "./execa.js";
import { deleteProtections } from "./steps/deleteProtections.js";
import { fetchProtections } from "./steps/fetchProtections.js";
import { recreateProtections } from "./steps/recreateProtections.js";
import { runReleaseIt } from "./steps/runReleaseIt.js";
import { tryCatchInfoAction } from "./tryCatchInfoAction.js";

export interface ReleaseItActionOptions {
	branch: string;
	githubToken: string;
	gitUserEmail: string;
	gitUserName: string;
	npmToken: string;
	owner: string;
	releaseItArgs?: string;
	repo: string;
	skipBranchProtections?: boolean;
}

export async function releaseItAction({
	branch,
	githubToken,
	gitUserEmail,
	gitUserName,
	npmToken,
	owner,
	releaseItArgs,
	repo,
	skipBranchProtections,
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
	await $$`npm config set //registry.npmjs.org/:_authToken ${npmToken}`;

	const octokit = github.getOctokit(githubToken);
	const commonRequestData = {
		branch,
		headers: {
			"X-GitHub-Api-Version": "2022-11-28",
		},
		owner,
		repo,
	};

	const existingProtections = await fetchProtections({
		branch,
		octokit,
		requestData: commonRequestData,
		skipBranchProtections,
	});

	await deleteProtections({
		branch,
		existingProtections,
		octokit,
		requestData: commonRequestData,
	});

	await runReleaseIt(releaseItArgs);

	await recreateProtections({
		commonRequestData,
		existingProtections,
		octokit,
	});
}

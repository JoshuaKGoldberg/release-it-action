import * as core from "@actions/core";
import * as github from "@actions/github";

import { getTokenInput } from "../getTokenInput.js";
import { releaseItAction } from "../index.js";

export async function runReleaseItAction(context: typeof github.context) {
	const gitUserName = core.getInput("git-user-name") || context.actor;

	await releaseItAction({
		bypassBranchProtections: core.getInput("bypass-branch-protections"),
		githubToken: getTokenInput("github-token", "GITHUB_TOKEN"),
		gitUserEmail:
			core.getInput("git-user-email") ||
			`${gitUserName}@users.noreply.github.com`,
		gitUserName,
		npmToken: getTokenInput("npm-token", "NPM_TOKEN"),
		owner: context.repo.owner,
		releaseItArgs: core.getInput("release-it-args"),
		repo: context.repo.repo,
	});
}

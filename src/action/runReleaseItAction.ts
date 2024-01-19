import * as core from "@actions/core";
import * as github from "@actions/github";

import { getTokenInput } from "../getTokenInput.js";
import { releaseItAction } from "../index.js";

export async function runReleaseItAction(context: typeof github.context) {
	const gitUserName = core.getInput("git-user-name") || context.actor;

	await releaseItAction({
		branch: core.getInput("branch") || "main",
		gitUserEmail:
			core.getInput("git-user-email") ||
			`${gitUserName}@users.noreply.github.com`,
		gitUserName,
		githubToken: getTokenInput("github-token", "GITHUB_TOKEN"),
		npmToken: getTokenInput("npm-token", "NPM_TOKEN"),
		owner: context.repo.owner,
		repo: context.repo.repo,
		skipBranchProtections: core.getBooleanInput("skip-branch-protections"),
	});
}

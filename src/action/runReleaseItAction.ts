import * as core from "@actions/core";
import * as github from "@actions/github";
import * as process from "node:process";

import { getTokenInput } from "../getTokenInput.js";
import { releaseItAction } from "../index.js";

export async function runReleaseItAction(context: typeof github.context) {
	const gitUserName = core.getInput("git-user-name") || context.actor;

	if (process.env.NPM_TOKEN) {
		core.warning(
			"release-it-action no longer uses NPM_TOKEN. Publish to npm with Trusted Publishing instead: https://docs.npmjs.com/trusted-publishers",
		);
	}

	await releaseItAction({
		bypassBranchProtections: core.getInput("bypass-branch-protections"),
		bypassBranchRulesets: core.getInput("bypass-branch-rulesets"),
		githubToken: getTokenInput("github-token", "GITHUB_TOKEN"),
		gitUserEmail:
			core.getInput("git-user-email") ||
			`${gitUserName}@users.noreply.github.com`,
		gitUserName,
		owner: context.repo.owner,
		releaseItArgs: core.getInput("release-it-args"),
		repo: context.repo.repo,
		skipNpmPublish: getOptionalBooleanInput("skip-npm-publish"),
	});
}

// core.getBooleanInput throws on an empty string, which is what an input
// resolves to when the action is run directly (e.g. `node dist/index.js`)
// instead of through `uses:`, since action.yml defaults only apply there.
function getOptionalBooleanInput(name: string) {
	return core.getInput(name) ? core.getBooleanInput(name) : false;
}

import * as fs from "node:fs/promises";

import { readPackageData, ReleaseItConfig } from "../packageData.js";
import { parseArgsString } from "../parseArgsString.js";
import { Octokit } from "../types.js";
import { getHeadTags, getVersionTagNames } from "../versionTags.js";
import { hasGitHubRelease } from "./hasGitHubRelease.js";

const configOverride =
	/^(?:-c|--config|--(?:no-)?github(?:\.(?:draft|release|web))?)(?:=|$)/;

export interface GetHeadTagMissingGitHubReleaseOptions {
	octokit: Octokit;
	owner: string;
	releaseItArgs: string | undefined;
	repo: string;
}

export async function getHeadTagMissingGitHubRelease({
	octokit,
	owner,
	releaseItArgs,
	repo,
}: GetHeadTagMissingGitHubReleaseOptions) {
	const packageData = await readPackageData();
	const version = packageData?.version;
	const { github } =
		(await readReleaseItJson()) ?? packageData?.["release-it"] ?? {};

	// Draft and web releases aren't found by tag, and release-it-args can override the config.
	if (
		!version ||
		!github?.release ||
		github.draft ||
		github.web ||
		parseArgsString(releaseItArgs ?? "").some((arg) => configOverride.test(arg))
	) {
		return undefined;
	}

	const headTags = await getHeadTags();
	const tag = getVersionTagNames(version).find((tagName) =>
		headTags.includes(tagName),
	);

	if (!tag || (await hasGitHubRelease({ octokit, owner, repo, tag }))) {
		return undefined;
	}

	return tag;
}

async function readReleaseItJson() {
	try {
		return JSON.parse(
			await fs.readFile(".release-it.json", "utf8"),
		) as ReleaseItConfig;
	} catch {
		return undefined;
	}
}

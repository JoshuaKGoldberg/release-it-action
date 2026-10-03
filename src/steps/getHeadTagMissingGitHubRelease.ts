import * as fs from "node:fs/promises";

import { $quiet } from "../execa.js";
import { parseArgsString } from "../parseArgsString.js";
import { Octokit } from "../types.js";
import { hasGitHubRelease } from "./hasGitHubRelease.js";

const configOverride =
	/^(?:-c|--config|--(?:no-)?github(?:\.(?:draft|release|web))?)(?:=|$)/;

export interface GetHeadTagMissingGitHubReleaseOptions {
	octokit: Octokit;
	owner: string;
	releaseItArgs: string | undefined;
	repo: string;
}

interface PackageData {
	"release-it"?: ReleaseItConfig;
	version?: string;
}

interface ReleaseItConfig {
	github?: { draft?: boolean; release?: boolean; web?: boolean };
}

export async function getHeadTagMissingGitHubRelease({
	octokit,
	owner,
	releaseItArgs,
	repo,
}: GetHeadTagMissingGitHubReleaseOptions) {
	const packageData = JSON.parse(
		await fs.readFile("package.json", "utf8"),
	) as PackageData;
	const { version } = packageData;
	const { github } =
		(await readReleaseItJson()) ?? packageData["release-it"] ?? {};

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

	const headTags = (await $quiet`git tag --points-at HEAD`).stdout.split("\n");
	const tag = [version, `v${version}`].find((tagName) =>
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

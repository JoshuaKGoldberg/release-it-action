import * as core from "@actions/core";
import * as fs from "node:fs/promises";

import { Octokit } from "../types.js";

export interface HasGitHubReleaseOptions {
	octokit: Octokit;
	owner: string;
	repo: string;
	tag: string;
}

interface PackageData {
	"release-it"?: ReleaseItConfig;
}

interface ReleaseItConfig {
	github?: { draft?: boolean };
}

export async function hasGitHubRelease({
	octokit,
	owner,
	repo,
	tag,
}: HasGitHubReleaseOptions) {
	try {
		await octokit.request("GET /repos/{owner}/{repo}/releases/tags/{tag}", {
			owner,
			repo,
			tag,
		});
		return true;
	} catch (error) {
		if ((error as { status?: number }).status !== 404) {
			throw error;
		}
	}

	// Draft releases aren't found by tag, so look for one in the full list.
	for await (const { data: releases } of octokit.paginate.iterator(
		"GET /repos/{owner}/{repo}/releases",
		{ owner, per_page: 100, repo },
	)) {
		const release = releases.find((release) => release.tag_name === tag);
		if (!release) {
			continue;
		}

		if (!release.draft || (await makesDraftReleases())) {
			return true;
		}

		core.info(
			`Found a leftover draft release for ${tag}, but release-it isn't configured to make draft releases, so treating the release as missing. You can delete the leftover draft.`,
		);
		return false;
	}

	return false;
}

async function makesDraftReleases() {
	const releaseItJson = await readJsonFile<ReleaseItConfig>(".release-it.json");
	const packageJson = await readJsonFile<PackageData>("package.json");

	return (
		(releaseItJson?.github?.draft ??
			packageJson?.["release-it"]?.github?.draft) === true
	);
}

async function readJsonFile<T>(path: string) {
	try {
		return JSON.parse(await fs.readFile(path, "utf8")) as T;
	} catch {
		return undefined;
	}
}

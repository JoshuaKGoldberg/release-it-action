import { Octokit } from "../types.js";

export interface HasGitHubReleaseOptions {
	octokit: Octokit;
	owner: string;
	repo: string;
	tag: string;
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
		if (releases.some((release) => release.tag_name === tag)) {
			return true;
		}
	}

	return false;
}

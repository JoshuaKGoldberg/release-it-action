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
		if ((error as { status?: number }).status === 404) {
			return false;
		}

		throw error;
	}
}

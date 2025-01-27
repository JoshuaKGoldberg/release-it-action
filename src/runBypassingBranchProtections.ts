import { deleteProtections } from "./steps/deleteProtections.js";
import { fetchProtections } from "./steps/fetchProtections.js";
import { recreateProtections } from "./steps/recreateProtections.js";
import { Octokit } from "./types.js";

export interface CommonData {
	branch: string;
	owner: string;
	repo: string;
}

export async function runBypassingBranchProtections(
	commonData: CommonData,
	octokit: Octokit,
	run: () => Promise<void>,
) {
	const commonRequestData = {
		...commonData,
		headers: {
			"X-GitHub-Api-Version": "2022-11-28",
		},
	};

	const existingProtections = await fetchProtections({
		octokit,
		requestData: commonRequestData,
	});

	await deleteProtections({
		existingProtections,
		octokit,
		requestData: commonRequestData,
	});

	await run();

	await recreateProtections({
		commonRequestData,
		existingProtections,
		octokit,
	});
}

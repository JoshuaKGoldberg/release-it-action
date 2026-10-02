import { createCommonRequestData } from "./createCommonRequestData.js";
import { deleteProtections } from "./steps/deleteProtections.js";
import { fetchProtections } from "./steps/fetchProtections.js";
import { recreateProtections } from "./steps/recreateProtections.js";
import { CommonData, Octokit } from "./types.js";

export async function runBypassingBranchProtections(
	commonData: CommonData,
	octokit: Octokit,
	run: () => Promise<void>,
) {
	const commonRequestData = createCommonRequestData(commonData);

	const existingProtections = await fetchProtections({
		octokit,
		requestData: commonRequestData,
	});

	await deleteProtections({
		existingProtections,
		octokit,
		requestData: commonRequestData,
	});

	try {
		await run();
	} finally {
		await recreateProtections({
			commonRequestData,
			existingProtections,
			octokit,
		});
	}
}

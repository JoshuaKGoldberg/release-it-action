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
	const requestData = createCommonRequestData(commonData);

	const existingProtections = await fetchProtections({
		octokit,
		requestData,
	});

	try {
		await deleteProtections({
			existingProtections,
			octokit,
			requestData,
		});
		await run();
	} finally {
		await recreateProtections({
			existingProtections,
			octokit,
			requestData,
		});
	}
}

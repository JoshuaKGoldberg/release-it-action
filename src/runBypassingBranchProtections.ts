import { createCommonRequestData } from "./createCommonRequestData.ts";
import { deleteProtections } from "./steps/deleteProtections.ts";
import { fetchProtections } from "./steps/fetchProtections.ts";
import { recreateProtections } from "./steps/recreateProtections.ts";
import { CommonData, Octokit } from "./types.ts";

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

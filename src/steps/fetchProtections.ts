import type { Endpoints } from "@octokit/types";

import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { ExistingProtections, Octokit } from "../types.js";

export interface FetchProtectionsOptions {
	octokit: Octokit;
	requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}

export async function fetchProtections({
	octokit,
	requestData,
}: FetchProtectionsOptions): Promise<ExistingProtections | undefined> {
	return await tryCatchInfoAction(
		`fetching existing branch protections for ${requestData.branch}`,
		async () =>
			await octokit.request(
				"GET /repos/{owner}/{repo}/branches/{branch}/protection",
				requestData,
			),
	);
}

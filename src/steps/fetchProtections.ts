import type { Endpoints } from "@octokit/types";

import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { ExistingProtections, Octokit } from "../types.js";

export interface FetchProtectionsOptions {
	branch: string;
	octokit: Octokit;
	requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
	skipBranchProtections: boolean | undefined;
}

export async function fetchProtections({
	branch,
	octokit,
	requestData,
	skipBranchProtections,
}: FetchProtectionsOptions): Promise<ExistingProtections | undefined> {
	return skipBranchProtections
		? undefined
		: await tryCatchInfoAction(
				`fetching existing branch protections for ${branch}`,
				async () =>
					await octokit.request(
						"GET /repos/{owner}/{repo}/branches/{branch}/protection",
						requestData,
					),
		  );
}

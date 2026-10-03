import type { Endpoints } from "@octokit/types";

import * as core from "@actions/core";

import { tryCatchThrowAction } from "../tryCatchInfoAction.js";
import { ExistingProtections, Octokit } from "../types.js";

const planUpgradeRequired = /^Upgrade to GitHub .+ to enable this feature/;

export interface FetchProtectionsOptions {
	octokit: Octokit;
	requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}

export async function fetchProtections({
	octokit,
	requestData,
}: FetchProtectionsOptions): Promise<ExistingProtections | undefined> {
	return await tryCatchThrowAction(
		`fetching existing branch protections for ${requestData.branch}`,
		async () => {
			try {
				return (
					await octokit.request(
						"GET /repos/{owner}/{repo}/branches/{branch}/protection",
						requestData,
					)
				).data;
			} catch (error) {
				const { response, status } = error as {
					response?: { data?: { message?: string } };
					status?: number;
				};

				const message = response?.data?.message ?? "";

				if (status === 404 && message === "Branch not protected") {
					return undefined;
				}

				if (status === 404 && message === "Branch not found") {
					core.warning(
						`Branch ${requestData.branch} doesn't exist, so it has no branch protections to bypass.`,
					);
					return undefined;
				}

				if (status === 403 && planUpgradeRequired.test(message)) {
					core.warning(
						`Branch protections aren't available on this repository's GitHub plan, so ${requestData.branch} has none to bypass.`,
					);
					return undefined;
				}

				throw error;
			}
		},
		`Could not fetch existing branch protections for ${requestData.branch}`,
	);
}

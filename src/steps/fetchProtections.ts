import type { Endpoints } from "@octokit/types";

import * as core from "@actions/core";

import { ExistingProtections, Octokit } from "../types.js";

export interface FetchProtectionsOptions {
	octokit: Octokit;
	requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}

export async function fetchProtections({
	octokit,
	requestData,
}: FetchProtectionsOptions): Promise<ExistingProtections | undefined> {
	const label = `fetching existing branch protections for ${requestData.branch}`;

	core.info(`Start: ${label}`);

	try {
		const { data } = await octokit.request(
			"GET /repos/{owner}/{repo}/branches/{branch}/protection",
			requestData,
		);
		core.info(`Result from ${label}: ${JSON.stringify(data, null, 4)}`);
		return data;
	} catch (error) {
		const { response, status } = error as {
			response?: { data?: { message?: string } };
			status?: number;
		};

		if (status === 404 && response?.data?.message === "Branch not protected") {
			return undefined;
		}

		throw new Error(
			`Could not fetch existing branch protections for ${requestData.branch}: ${String(error)}`,
			{ cause: error },
		);
	}
}

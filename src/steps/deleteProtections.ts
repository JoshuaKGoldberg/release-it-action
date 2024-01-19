import type { Endpoints } from "@octokit/types";

import * as core from "@actions/core";

import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { Octokit } from "../types.js";

export interface DeleteProtectionsOptions {
	branch: string;
	existingProtections: object | undefined;
	octokit: Octokit;
	requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}

export async function deleteProtections({
	branch,
	existingProtections,
	octokit,
	requestData,
}: DeleteProtectionsOptions) {
	if (existingProtections) {
		await tryCatchInfoAction(
			`deleting existing protections for ${branch}`,
			async () =>
				await octokit.request(
					`DELETE /repos/{owner}/{repo}/branches/{branch}/protection`,
					requestData,
				),
		);
	} else {
		core.info(`No existing branch protections found for ${branch}.`);
	}
}

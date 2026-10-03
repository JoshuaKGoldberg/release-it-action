import type { Endpoints } from "@octokit/types";

import * as core from "@actions/core";

import { tryCatchThrowAction } from "../tryCatchInfoAction.js";
import { Octokit } from "../types.js";

export interface DeleteProtectionsOptions {
	existingProtections: object | undefined;
	octokit: Octokit;
	requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}

export async function deleteProtections({
	existingProtections,
	octokit,
	requestData,
}: DeleteProtectionsOptions) {
	if (existingProtections) {
		await tryCatchThrowAction(
			`deleting existing protections for ${requestData.branch}`,
			async () => {
				await octokit.request(
					`DELETE /repos/{owner}/{repo}/branches/{branch}/protection`,
					requestData,
				);
			},
			`Could not delete existing branch protections for ${requestData.branch}`,
		);
	} else {
		core.info(
			`No existing branch protections found for ${requestData.branch}.`,
		);
	}
}

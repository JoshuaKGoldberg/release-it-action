import type { Endpoints } from "@octokit/types";

import * as core from "@actions/core";

import { ExistingProtections, Octokit } from "../types.js";

export interface DeleteProtectionsOptions {
	existingProtections: ExistingProtections | undefined;
	octokit: Octokit;
	requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}

export async function deleteProtections({
	existingProtections,
	octokit,
	requestData,
}: DeleteProtectionsOptions) {
	if (existingProtections) {
		core.info(`Start: deleting existing protections for ${requestData.branch}`);

		try {
			await octokit.request(
				`DELETE /repos/{owner}/{repo}/branches/{branch}/protection`,
				requestData,
			);
		} catch (error) {
			throw new Error(
				`Could not delete existing branch protections for ${requestData.branch}: ${String(error)}`,
				{ cause: error },
			);
		}
	} else {
		core.info(
			`No existing branch protections found for ${requestData.branch}.`,
		);
	}
}

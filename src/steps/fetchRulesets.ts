import type { Endpoints } from "@octokit/types";

import * as core from "@actions/core";

import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { ExistingRuleset, Octokit } from "../types.js";

export interface FetchRulesetsOptions {
	octokit: Octokit;
	requestData: Endpoints["GET /repos/{owner}/{repo}/rules/branches/{branch}"]["parameters"];
}

export async function fetchRulesets({
	octokit,
	requestData,
}: FetchRulesetsOptions): Promise<ExistingRuleset[] | undefined> {
	const rules = await tryCatchInfoAction(
		`fetching existing branch rules for ${requestData.branch}`,
		async () =>
			(
				await octokit.request(
					"GET /repos/{owner}/{repo}/rules/branches/{branch}",
					requestData,
				)
			).data,
	);

	if (!rules) {
		return undefined;
	}

	const rulesetIds = new Set<number>();

	for (const rule of rules) {
		if (rule.ruleset_id === undefined) {
			continue;
		}

		// Only repository rulesets can be updated with a repository-scoped token.
		if (rule.ruleset_source_type === "Repository") {
			rulesetIds.add(rule.ruleset_id);
		} else {
			core.info(
				`Skipping ${rule.ruleset_source_type ?? "unknown"} ruleset ${rule.ruleset_id.toString()} (${rule.ruleset_source ?? "unknown source"}): only repository rulesets can be bypassed.`,
			);
		}
	}

	const rulesets: ExistingRuleset[] = [];

	for (const rulesetId of rulesetIds) {
		const ruleset = await tryCatchInfoAction(
			`fetching existing ruleset ${rulesetId.toString()}`,
			async () =>
				(
					await octokit.request(
						"GET /repos/{owner}/{repo}/rulesets/{ruleset_id}",
						{
							...requestData,
							ruleset_id: rulesetId,
						},
					)
				).data,
		);

		if (ruleset) {
			rulesets.push(ruleset);
		}
	}

	return rulesets;
}

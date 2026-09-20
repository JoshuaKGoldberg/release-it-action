import type { RequestParameters } from "@octokit/types";

import * as core from "@actions/core";

import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { ExistingRuleset, Octokit, RulesetEnforcement } from "../types.js";

export interface UpdateRulesetsEnforcementOptions {
	commonRequestData: RequestParameters & { owner: string; repo: string };
	enforcement: (ruleset: ExistingRuleset) => RulesetEnforcement;
	existingRulesets: ExistingRuleset[] | undefined;
	octokit: Octokit;
}

export async function updateRulesetsEnforcement({
	commonRequestData,
	enforcement,
	existingRulesets,
	octokit,
}: UpdateRulesetsEnforcementOptions) {
	if (!existingRulesets?.length) {
		core.info("No existing repository rulesets found to update.");
		return;
	}

	for (const existingRuleset of existingRulesets) {
		const nextEnforcement = enforcement(existingRuleset);

		await tryCatchInfoAction(
			`setting ruleset ${existingRuleset.id.toString()} (${existingRuleset.name}) enforcement to ${nextEnforcement}`,
			async () =>
				await octokit.request(
					"PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}",
					{
						...commonRequestData,
						enforcement: nextEnforcement,
						ruleset_id: existingRuleset.id,
					},
				),
		);
	}
}

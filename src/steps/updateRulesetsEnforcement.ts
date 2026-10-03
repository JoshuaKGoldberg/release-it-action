import type { RequestParameters } from "@octokit/types";

import * as core from "@actions/core";

import {
	tryCatchSetFailedAction,
	tryCatchThrowAction,
} from "../tryCatchAction.js";
import { ExistingRuleset, Octokit, RulesetEnforcement } from "../types.js";

export interface UpdateRulesetsEnforcementOptions {
	enforcement: (ruleset: ExistingRuleset) => RulesetEnforcement;
	existingRulesets: ExistingRuleset[];
	octokit: Octokit;
	requestData: RequestParameters & { owner: string; repo: string };
	setFailedOnError?: boolean;
}

export async function updateRulesetsEnforcement({
	enforcement,
	existingRulesets,
	octokit,
	requestData,
	setFailedOnError,
}: UpdateRulesetsEnforcementOptions) {
	if (!existingRulesets.length) {
		core.info("No existing repository rulesets found to update.");
		return;
	}

	for (const existingRuleset of existingRulesets) {
		const nextEnforcement = enforcement(existingRuleset);
		const description = `ruleset ${existingRuleset.id.toString()} (${existingRuleset.name}) enforcement to ${nextEnforcement}`;
		const update = async () => {
			await octokit.request("PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}", {
				...requestData,
				enforcement: nextEnforcement,
				ruleset_id: existingRuleset.id,
			});
		};

		if (setFailedOnError) {
			await tryCatchSetFailedAction(`setting ${description}`, update);
		} else {
			await tryCatchThrowAction(
				`setting ${description}`,
				update,
				`Could not set ${description}`,
			);
		}
	}
}

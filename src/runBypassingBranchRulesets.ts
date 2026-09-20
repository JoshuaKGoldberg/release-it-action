import { CommonData } from "./runBypassingBranchProtections.js";
import { fetchRulesets } from "./steps/fetchRulesets.js";
import { updateRulesetsEnforcement } from "./steps/updateRulesetsEnforcement.js";
import { Octokit } from "./types.js";

export async function runBypassingBranchRulesets(
	commonData: CommonData,
	octokit: Octokit,
	run: () => Promise<void>,
) {
	const commonRequestData = {
		...commonData,
		headers: {
			"X-GitHub-Api-Version": "2022-11-28",
		},
	};

	const existingRulesets = await fetchRulesets({
		octokit,
		requestData: commonRequestData,
	});

	await updateRulesetsEnforcement({
		commonRequestData,
		enforcement: () => "disabled",
		existingRulesets,
		octokit,
	});

	await run();

	await updateRulesetsEnforcement({
		commonRequestData,
		enforcement: (ruleset) => ruleset.enforcement,
		existingRulesets,
		octokit,
	});
}

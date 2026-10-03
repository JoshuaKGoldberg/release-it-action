import { createCommonRequestData } from "./createCommonRequestData.js";
import { fetchRulesets } from "./steps/fetchRulesets.js";
import { updateRulesetsEnforcement } from "./steps/updateRulesetsEnforcement.js";
import { CommonData, Octokit } from "./types.js";

export async function runBypassingBranchRulesets(
	commonData: CommonData,
	octokit: Octokit,
	run: () => Promise<void>,
) {
	const commonRequestData = createCommonRequestData(commonData);

	const existingRulesets = await fetchRulesets({
		octokit,
		requestData: commonRequestData,
	});

	try {
		await updateRulesetsEnforcement({
			commonRequestData,
			enforcement: () => "disabled",
			existingRulesets,
			octokit,
		});
		await run();
	} finally {
		await updateRulesetsEnforcement({
			commonRequestData,
			enforcement: (ruleset) => ruleset.enforcement,
			existingRulesets,
			octokit,
			setFailedOnError: true,
		});
	}
}

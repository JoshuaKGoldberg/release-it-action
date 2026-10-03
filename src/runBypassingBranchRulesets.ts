import { createCommonRequestData } from "./createCommonRequestData.js";
import { fetchRulesets } from "./steps/fetchRulesets.js";
import { updateRulesetsEnforcement } from "./steps/updateRulesetsEnforcement.js";
import { CommonData, Octokit } from "./types.js";

export async function runBypassingBranchRulesets(
	commonData: CommonData,
	octokit: Octokit,
	run: () => Promise<void>,
) {
	const requestData = createCommonRequestData(commonData);

	const existingRulesets = await fetchRulesets({
		octokit,
		requestData,
	});

	try {
		await updateRulesetsEnforcement({
			enforcement: () => "disabled",
			existingRulesets,
			octokit,
			requestData,
		});
		await run();
	} finally {
		await updateRulesetsEnforcement({
			enforcement: (ruleset) => ruleset.enforcement,
			existingRulesets,
			octokit,
			requestData,
			setFailedOnError: true,
		});
	}
}

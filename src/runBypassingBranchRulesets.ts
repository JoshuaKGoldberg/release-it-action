import { createCommonRequestData } from "./createCommonRequestData.ts";
import { fetchRulesets } from "./steps/fetchRulesets.ts";
import { updateRulesetsEnforcement } from "./steps/updateRulesetsEnforcement.ts";
import { CommonData, Octokit } from "./types.ts";

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

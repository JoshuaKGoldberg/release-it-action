import type { Endpoints } from "@octokit/types";

import * as core from "@actions/core";

import { ExistingRuleset, Octokit } from "../types.js";

const planUpgradeRequired = /^Upgrade to GitHub .+ to enable this feature/;

export interface FetchRulesetsOptions {
	octokit: Octokit;
	requestData: Endpoints["GET /repos/{owner}/{repo}/rules/branches/{branch}"]["parameters"];
}

export async function fetchRulesets({
	octokit,
	requestData,
}: FetchRulesetsOptions): Promise<ExistingRuleset[]> {
	const rules = await fetchLogged(
		`existing branch rules for ${requestData.branch}`,
		async () => {
			try {
				return await octokit.paginate(
					"GET /repos/{owner}/{repo}/rules/branches/{branch}",
					{
						...requestData,
						per_page: 100,
					},
				);
			} catch (error) {
				const { response, status } = error as {
					response?: { data?: { message?: string } };
					status?: number;
				};

				if (
					status === 403 &&
					planUpgradeRequired.test(response?.data?.message ?? "")
				) {
					core.warning(
						`Repository rulesets aren't available on this repository's GitHub plan, so ${requestData.branch} has none to bypass.`,
					);
					return [];
				}

				throw error;
			}
		},
	);

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
		const ruleset = await fetchLogged(
			`existing ruleset ${rulesetId.toString()}`,
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

		rulesets.push(ruleset);
	}

	return rulesets;
}

async function fetchLogged<T>(description: string, fetch: () => Promise<T>) {
	core.info(`Start: fetching ${description}`);

	let result: T;

	try {
		result = await fetch();
	} catch (error) {
		throw new Error(`Could not fetch ${description}: ${String(error)}`, {
			cause: error,
		});
	}

	core.info(
		`Result from fetching ${description}: ${JSON.stringify(result, null, 4)}`,
	);

	return result;
}

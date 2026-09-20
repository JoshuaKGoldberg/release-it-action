import type * as github from "@actions/github";
import type { Endpoints } from "@octokit/types";

export type ExistingProtections =
	Endpoints["GET /repos/{owner}/{repo}/branches/{branch}/protection"]["response"]["data"];

export type ExistingRuleset = Pick<
	Endpoints["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}"]["response"]["data"],
	"enforcement" | "id" | "name"
>;

export type Octokit = ReturnType<typeof github.getOctokit>;

export type RulesetEnforcement = ExistingRuleset["enforcement"];

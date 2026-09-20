import type { Endpoints } from "@octokit/types";
import { ExistingRuleset, Octokit } from "../types.js";
export interface FetchRulesetsOptions {
    octokit: Octokit;
    requestData: Endpoints["GET /repos/{owner}/{repo}/rules/branches/{branch}"]["parameters"];
}
export declare function fetchRulesets({ octokit, requestData, }: FetchRulesetsOptions): Promise<ExistingRuleset[] | undefined>;
//# sourceMappingURL=fetchRulesets.d.ts.map
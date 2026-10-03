import type { RequestParameters } from "@octokit/types";
import { ExistingRuleset, Octokit, RulesetEnforcement } from "../types.js";
export interface UpdateRulesetsEnforcementOptions {
    commonRequestData: RequestParameters & {
        owner: string;
        repo: string;
    };
    enforcement: (ruleset: ExistingRuleset) => RulesetEnforcement;
    existingRulesets: ExistingRuleset[];
    octokit: Octokit;
    setFailedOnError?: boolean;
}
export declare function updateRulesetsEnforcement({ commonRequestData, enforcement, existingRulesets, octokit, setFailedOnError, }: UpdateRulesetsEnforcementOptions): Promise<void>;
//# sourceMappingURL=updateRulesetsEnforcement.d.ts.map
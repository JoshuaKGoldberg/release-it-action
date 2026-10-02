import { CommonData, Octokit } from "./types.js";
export declare function runBypassingBranchRulesets(commonData: CommonData, octokit: Octokit, run: () => Promise<void>): Promise<void>;

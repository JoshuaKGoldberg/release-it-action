import { CommonData, Octokit } from "./types.js";
export declare function runBypassingBranchProtections(commonData: CommonData, octokit: Octokit, run: () => Promise<void>): Promise<void>;

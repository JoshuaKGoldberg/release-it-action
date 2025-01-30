import { Octokit } from "./types.js";
export interface CommonData {
    branch: string;
    owner: string;
    repo: string;
}
export declare function runBypassingBranchProtections(commonData: CommonData, octokit: Octokit, run: () => Promise<void>): Promise<void>;

import type { Endpoints } from "@octokit/types";
import { ExistingProtections, Octokit } from "../types.js";
export interface FetchProtectionsOptions {
    branch: string;
    octokit: Octokit;
    requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
    skipBranchProtections: boolean | undefined;
}
export declare function fetchProtections({ branch, octokit, requestData, skipBranchProtections, }: FetchProtectionsOptions): Promise<ExistingProtections | undefined>;
//# sourceMappingURL=fetchProtections.d.ts.map
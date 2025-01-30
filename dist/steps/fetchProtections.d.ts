import type { Endpoints } from "@octokit/types";
import { ExistingProtections, Octokit } from "../types.js";
export interface FetchProtectionsOptions {
    octokit: Octokit;
    requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}
export declare function fetchProtections({ octokit, requestData, }: FetchProtectionsOptions): Promise<ExistingProtections | undefined>;
//# sourceMappingURL=fetchProtections.d.ts.map
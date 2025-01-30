import type { Endpoints } from "@octokit/types";
import { Octokit } from "../types.js";
export interface DeleteProtectionsOptions {
    existingProtections: object | undefined;
    octokit: Octokit;
    requestData: Endpoints["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];
}
export declare function deleteProtections({ existingProtections, octokit, requestData, }: DeleteProtectionsOptions): Promise<void>;
//# sourceMappingURL=deleteProtections.d.ts.map
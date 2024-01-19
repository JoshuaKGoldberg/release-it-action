import type { RequestParameters } from "@octokit/types";
import { ExistingProtections, Octokit } from "../types.js";
export interface RecreateProtectionsOptions {
    commonRequestData: RequestParameters;
    existingProtections: ExistingProtections | undefined;
    octokit: Octokit;
}
export declare function recreateProtections({ commonRequestData, existingProtections, octokit, }: RecreateProtectionsOptions): Promise<void>;
//# sourceMappingURL=recreateProtections.d.ts.map
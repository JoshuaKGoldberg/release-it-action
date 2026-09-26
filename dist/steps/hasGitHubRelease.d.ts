import { Octokit } from "../types.js";
export interface HasGitHubReleaseOptions {
    octokit: Octokit;
    owner: string;
    repo: string;
    tag: string;
}
export declare function hasGitHubRelease({ octokit, owner, repo, tag, }: HasGitHubReleaseOptions): Promise<boolean>;
//# sourceMappingURL=hasGitHubRelease.d.ts.map
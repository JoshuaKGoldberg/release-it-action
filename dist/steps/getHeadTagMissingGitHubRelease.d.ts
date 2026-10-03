import { Octokit } from "../types.js";
export interface GetHeadTagMissingGitHubReleaseOptions {
    octokit: Octokit;
    owner: string;
    releaseItArgs: string | undefined;
    repo: string;
}
export declare function getHeadTagMissingGitHubRelease({ octokit, owner, releaseItArgs, repo, }: GetHeadTagMissingGitHubReleaseOptions): Promise<string | undefined>;
//# sourceMappingURL=getHeadTagMissingGitHubRelease.d.ts.map
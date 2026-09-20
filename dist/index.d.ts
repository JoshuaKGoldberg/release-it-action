export interface ReleaseItActionOptions {
    bypassBranchProtections?: string;
    githubToken: string;
    gitUserEmail: string;
    gitUserName: string;
    npmToken: string | undefined;
    owner: string;
    releaseItArgs?: string;
    repo: string;
    skipNpmPublish?: boolean;
}
export declare function releaseItAction({ bypassBranchProtections, githubToken, gitUserEmail, gitUserName, npmToken, owner, releaseItArgs, repo, skipNpmPublish, }: ReleaseItActionOptions): Promise<void>;

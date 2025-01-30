export interface ReleaseItActionOptions {
    bypassBranchProtections?: string;
    githubToken: string;
    gitUserEmail: string;
    gitUserName: string;
    npmToken: string;
    owner: string;
    releaseItArgs?: string;
    repo: string;
}
export declare function releaseItAction({ bypassBranchProtections, githubToken, gitUserEmail, gitUserName, npmToken, owner, releaseItArgs, repo, }: ReleaseItActionOptions): Promise<void>;

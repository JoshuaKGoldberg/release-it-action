export interface ReleaseItActionOptions {
    branch: string;
    githubToken: string;
    gitUserEmail: string;
    gitUserName: string;
    npmToken: string;
    owner: string;
    releaseItArgs?: string;
    repo: string;
    skipBranchProtections?: boolean;
}
export declare function releaseItAction({ branch, githubToken, gitUserEmail, gitUserName, npmToken, owner, releaseItArgs, repo, skipBranchProtections, }: ReleaseItActionOptions): Promise<void>;

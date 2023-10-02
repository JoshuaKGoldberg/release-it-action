export interface ReleaseItActionOptions {
    branch: string;
    gitUserEmail: string;
    gitUserName: string;
    githubToken: string;
    npmToken: string;
    owner: string;
    repo: string;
    skipBranchProtections?: boolean;
}
export declare function releaseItAction({ branch, gitUserEmail, gitUserName, githubToken, npmToken, owner, repo, skipBranchProtections, }: ReleaseItActionOptions): Promise<void>;

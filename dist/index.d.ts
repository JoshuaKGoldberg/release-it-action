export interface ReleaseItActionOptions {
    bypassBranchProtections?: string;
    githubToken: string;
    gitUserEmail: string;
    gitUserName: string;
    npmPublish?: boolean;
    npmToken: string | undefined;
    owner: string;
    releaseItArgs?: string;
    repo: string;
}
export declare function releaseItAction({ bypassBranchProtections, githubToken, gitUserEmail, gitUserName, npmPublish, npmToken, owner, releaseItArgs, repo, }: ReleaseItActionOptions): Promise<void>;

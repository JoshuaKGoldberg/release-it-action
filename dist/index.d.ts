export interface ReleaseItActionOptions {
    bypassBranchProtections?: string;
    bypassBranchRulesets?: string;
    githubToken: string;
    gitUserEmail: string;
    gitUserName: string;
    npmToken: string | undefined;
    owner: string;
    releaseItArgs?: string;
    repo: string;
    skipNpmPublish?: boolean;
}
export declare function releaseItAction(options: ReleaseItActionOptions): Promise<void>;

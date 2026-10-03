export interface RunReleaseItOptions {
    allowPublishConflict?: boolean;
    githubToken: string;
    skipSupersededCheck?: boolean;
}
export declare function runReleaseIt(releaseItArgs: string, { allowPublishConflict, githubToken, skipSupersededCheck, }: RunReleaseItOptions): Promise<void>;
//# sourceMappingURL=runReleaseIt.d.ts.map
export interface RunReleaseItOptions {
    allowPublishConflict?: boolean;
    enforcedArgs?: string[];
    skipSupersededCheck?: boolean;
}
export declare function runReleaseIt(releaseItArgs?: string, { allowPublishConflict, enforcedArgs, skipSupersededCheck, }?: RunReleaseItOptions): Promise<void>;
//# sourceMappingURL=runReleaseIt.d.ts.map
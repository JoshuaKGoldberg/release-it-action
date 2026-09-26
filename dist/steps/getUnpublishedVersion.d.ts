export interface UnpublishedVersion {
    /**
     * The version's Git tag if it points at HEAD, meaning HEAD is its release commit.
     */
    headTag: string | undefined;
    version: string;
}
export declare function getUnpublishedVersion(): Promise<undefined | UnpublishedVersion>;
//# sourceMappingURL=getUnpublishedVersion.d.ts.map
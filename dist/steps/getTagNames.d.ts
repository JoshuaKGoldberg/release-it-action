export interface TagNamesPackageData {
    name: string;
    "release-it"?: ReleaseItConfig;
    version: string;
}
interface ReleaseItConfig {
    git?: {
        tagName?: unknown;
    };
}
export declare function getTagNames(packageData: TagNamesPackageData): Promise<string[]>;
export {};
//# sourceMappingURL=getTagNames.d.ts.map
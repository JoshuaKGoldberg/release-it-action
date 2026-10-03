export declare const defaultRegistry = "https://registry.npmjs.org/";
export interface PublishRegistryData {
    name?: string;
    publishConfig?: Record<string, unknown>;
}
export declare function getPublishRegistry({ name, publishConfig, }: PublishRegistryData): Promise<string>;
export declare function getScopedRegistryKey(name: string | undefined): string | undefined;

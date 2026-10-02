export interface PublishRegistryData {
    name?: string;
    publishConfig?: Record<string, unknown> & {
        registry?: string;
    };
}
export declare function getPublishRegistry({ name, publishConfig, }: PublishRegistryData): string | undefined;

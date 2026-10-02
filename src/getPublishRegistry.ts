export interface PublishRegistryData {
	name?: string;
	publishConfig?: Record<string, unknown> & { registry?: string };
}

export function getPublishRegistry({
	name,
	publishConfig,
}: PublishRegistryData) {
	const scopedRegistry = name?.startsWith("@")
		? publishConfig?.[`${name.split("/")[0]}:registry`]
		: undefined;

	return typeof scopedRegistry === "string" && scopedRegistry
		? scopedRegistry
		: publishConfig?.registry;
}

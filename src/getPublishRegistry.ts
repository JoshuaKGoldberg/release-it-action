import { $ } from "execa";

const $quiet = $({ reject: false });

const defaultRegistry = "https://registry.npmjs.org/";

export interface PublishRegistryData {
	name?: string;
	publishConfig?: Record<string, unknown>;
}

export async function getPublishRegistry({
	name,
	publishConfig,
}: PublishRegistryData) {
	const scopedRegistryKey = getScopedRegistryKey(name);
	const keys = scopedRegistryKey
		? [scopedRegistryKey, "registry"]
		: ["registry"];

	// This matches npm's order: publishConfig, then npm config, for each key.
	for (const key of keys) {
		const registry =
			getRegistryValue(publishConfig?.[key]) ??
			(await getNpmConfigRegistry(key));

		if (registry) {
			return registry;
		}
	}

	return defaultRegistry;
}

export function getScopedRegistryKey(name: string | undefined) {
	return name?.startsWith("@") ? `${name.split("/")[0]}:registry` : undefined;
}

async function getNpmConfigRegistry(key: string) {
	const { exitCode, stdout } = await $quiet`npm config get ${key}`;
	const value = stdout.trim();

	return exitCode || value === "undefined"
		? undefined
		: getRegistryValue(value);
}

function getRegistryValue(value: unknown) {
	return typeof value === "string" && value ? value : undefined;
}
